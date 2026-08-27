/**
 * PT BENING KHATULISTIWA — PROJECT TRACKER API
 * ---------------------------------------------
 * Paste this whole file into: Extensions > Apps Script (opened FROM your
 * "Project Tracker_PT Bening Khatulistiwa" spreadsheet, so it binds to it
 * automatically — no spreadsheet ID needed).
 *
 * Then: Deploy > New deployment > type "Web app" >
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web App URL into your Next.js .env.local as NEXT_PUBLIC_API_URL.
 *
 * Every read/write here happens directly on your live sheets, so editing the
 * spreadsheet by hand and editing through the website both update the same
 * data — that's what makes the two-way sync work.
 */

// ---- CONFIG: adjust these two if your tab names differ ----
const SHEET_PROJECTS = 'Project Tracker';
const SHEET_CHECKLIST = 'Engineering Deliverables Checklist';

// ---- Stage → progress mapping (copied from your reference table) ----
const STAGE_WEIGHTS = {
  'PO': 5,
  'SOS': 10,
  'BOM, PID, EWD, GAD': 25,
  'Review & Approval': 30,
  'Procurement of Material': 45,
  'Collecting Material / Inspection': 55,
  'Fabrication': 70,
  'Delivery': 90,
  'Installation': 95,
  'Commissioning': 97,
  'Preparation Manual Book': 98,
  'Hand Over and Finished': 100
};
const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const CHECKLIST_ITEMS = [
  'BOM (Bill of Materials)',
  'P&ID (Drawings)',
  'EWD (Electrical Wiring)',
  'GAD (General Arrangement)',
  'Commissioning Report',
  'Manual Book',
  'Handover Report'
];
const CHECKLIST_STATUSES = ['Not Started', 'Drafting', 'Under Review', 'Completed', 'N/A'];
// Weight per checklist status used to compute Progress (%).
// Tune these if they don't match your own formula exactly.
const CHECKLIST_WEIGHTS = { 'Not Started': 0, 'Drafting': 30, 'Under Review': 70, 'Completed': 100 };

// ------------------------------------------------------------------
// HTTP entry points
// ------------------------------------------------------------------
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'projects';
    let data;
    if (action === 'projects') data = getProjects_();
    else if (action === 'dashboard') data = computeDashboard_(getProjects_());
    else if (action === 'meta') data = getMeta_();
    else throw new Error('Unknown action: ' + action);
    return jsonOut_({ ok: true, data: data });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    let data;
    if (action === 'addProject') data = addProject_(body.payload);
    else if (action === 'updateProject') data = updateProject_(body.payload);
    else if (action === 'updateChecklist') data = updateChecklist_(body.payload);
    else throw new Error('Unknown action: ' + action);
    return jsonOut_({ ok: true, data: data });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMeta_() {
  return {
    stages: Object.keys(STAGE_WEIGHTS),
    stageWeights: STAGE_WEIGHTS,
    statuses: STATUSES,
    priorities: PRIORITIES,
    checklistItems: CHECKLIST_ITEMS,
    checklistStatuses: CHECKLIST_STATUSES
  };
}

// ------------------------------------------------------------------
// Sheet <-> object helpers
// ------------------------------------------------------------------
function getSheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  return sh;
}

function sheetToObjects_(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // skip fully empty rows (no PO Number and no Project Name)
    const poIdx = headers.indexOf('PO Number');
    const nameIdx = headers.indexOf('Project Name');
    if (!row[poIdx] && !row[nameIdx]) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = row[idx]; });
    obj._row = i + 1; // 1-based sheet row number, for updates
    rows.push(obj);
  }
  return rows;
}

function toPercentNumber_(val) {
  if (val === '' || val === null || val === undefined) return 0;
  if (typeof val === 'number') return val <= 1 ? Math.round(val * 100) : Math.round(val);
  const n = parseFloat(String(val).replace('%', '').trim());
  return isNaN(n) ? 0 : n;
}

function formatDate_(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(val);
}

// ------------------------------------------------------------------
// Read
// ------------------------------------------------------------------
function getProjects_() {
  const projRows = sheetToObjects_(getSheet_(SHEET_PROJECTS));
  const checkRows = sheetToObjects_(getSheet_(SHEET_CHECKLIST));
  const checkByPO = {};
  checkRows.forEach(function (c) { checkByPO[String(c['PO Number'])] = c; });

  return projRows.map(function (p) {
    const c = checkByPO[String(p['PO Number'])] || null;
    return {
      row: p._row,
      no: p['No'],
      poNumber: p['PO Number'],
      projectName: p['Project Name'],
      client: p['Client'],
      technology: p['Technology/Capacity'],
      pic: p['PIC'],
      currentStage: p['Current Stage'],
      status: p['Status'],
      stageProgress: toPercentNumber_(p['Stage Progress (%)']),
      engineeringDocProgress: toPercentNumber_(p['Engineering Doc Progress (%)']),
      priority: p['Priority'],
      tanggalPO: formatDate_(p['Tanggal PO']),
      tanggalDP: formatDate_(p['Tanggal DP']),
      deadlineDelivery: formatDate_(p['Deadline Delivery']),
      daysRemaining: p['Days Remaining'],
      remarks: p['Remarks'],
      targetFinishDate: formatDate_(p['Target Finish Date']),
      checklist: c ? {
        row: c._row,
        overallStatus: c['Overall Status'],
        items: CHECKLIST_ITEMS.reduce(function (acc, key) { acc[key] = c[key] || 'Not Started'; return acc; }, {}),
        progress: toPercentNumber_(c['Progress (%)'])
      } : null
    };
  });
}

function computeDashboard_(projects) {
  const buckets = { preDelivery: 0, delivered: 0, completed: 0 };
  projects.forEach(function (p) {
    const sp = p.stageProgress;
    if (sp >= 100) buckets.completed++;
    else if (sp >= 90) buckets.delivered++;
    else buckets.preDelivery++;
  });
  return {
    total: projects.length,
    preDelivery: buckets.preDelivery,
    delivered: buckets.delivered,
    completed: buckets.completed
  };
}

// ------------------------------------------------------------------
// Write: add / update project
// ------------------------------------------------------------------
function addProject_(payload) {
  const sheet = getSheet_(SHEET_PROJECTS);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const data = sheet.getDataRange().getValues();

  // next "No"
  let maxNo = 0;
  for (let i = 1; i < data.length; i++) {
    const n = parseFloat(data[i][headers.indexOf('No')]);
    if (!isNaN(n) && n > maxNo) maxNo = n;
  }
  const nextNo = maxNo + 1;

  const stage = payload.currentStage || 'PO';
  const stageProgress = (STAGE_WEIGHTS[stage] || 0) / 100;

  const rowObj = {
    'No': nextNo,
    'PO Number': payload.poNumber || '',
    'Project Name': payload.projectName || '',
    'Client': payload.client || '',
    'Technology/Capacity': payload.technology || '',
    'PIC': payload.pic || '',
    'Current Stage': stage,
    'Status': payload.status || 'In Progress',
    'Stage Progress (%)': stageProgress,
    'Engineering Doc Progress (%)': 0,
    'Priority': payload.priority || 'Medium',
    'Tanggal PO': payload.tanggalPO || '',
    'Tanggal DP': payload.tanggalDP || '',
    'Deadline Delivery': payload.deadlineDelivery || '',
    'Days Remaining': computeDaysRemaining_(payload.deadlineDelivery),
    'Remarks': payload.remarks || '',
    'Target Finish Date': payload.targetFinishDate || '',
    'Helper Active Index': ''
  };
  const newRow = headers.map(function (h) { return rowObj.hasOwnProperty(h) ? rowObj[h] : ''; });
  sheet.appendRow(newRow);

  // matching blank checklist row
  const checkSheet = getSheet_(SHEET_CHECKLIST);
  const checkHeaders = checkSheet.getRange(1, 1, 1, checkSheet.getLastColumn()).getValues()[0];
  const checkObj = {
    'PO Number': payload.poNumber || '',
    'Project Name': payload.projectName || '',
    'Client': payload.client || '',
    'Overall Status': 'Not Started',
    'Progress (%)': 0
  };
  CHECKLIST_ITEMS.forEach(function (item) { checkObj[item] = 'Not Started'; });
  const newCheckRow = checkHeaders.map(function (h) { return checkObj.hasOwnProperty(h) ? checkObj[h] : ''; });
  checkSheet.appendRow(newCheckRow);

  return { poNumber: payload.poNumber };
}

function findRowByPO_(sheet, poNumber) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const poCol = headers.indexOf('PO Number') + 1;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][poCol - 1]) === String(poNumber)) return { rowIndex: i + 1, headers: headers };
  }
  return null;
}

function computeDaysRemaining_(deadlineStr) {
  if (!deadlineStr) return '';
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return '';
  const today = new Date();
  const diff = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function updateProject_(payload) {
  const sheet = getSheet_(SHEET_PROJECTS);
  const found = findRowByPO_(sheet, payload.poNumber);
  if (!found) throw new Error('Project not found: ' + payload.poNumber);
  const headers = found.headers;
  const rowIndex = found.rowIndex;

  function setCell(colName, value) {
    const col = headers.indexOf(colName) + 1;
    if (col > 0) sheet.getRange(rowIndex, col).setValue(value);
  }
  if (payload.projectName !== undefined) setCell('Project Name', payload.projectName);
  if (payload.client !== undefined) setCell('Client', payload.client);
  if (payload.technology !== undefined) setCell('Technology/Capacity', payload.technology);
  if (payload.pic !== undefined) setCell('PIC', payload.pic);
  if (payload.priority !== undefined) setCell('Priority', payload.priority);
  if (payload.status !== undefined) setCell('Status', payload.status);
  if (payload.remarks !== undefined) setCell('Remarks', payload.remarks);
  if (payload.tanggalPO !== undefined) setCell('Tanggal PO', payload.tanggalPO);
  if (payload.tanggalDP !== undefined) setCell('Tanggal DP', payload.tanggalDP);
  if (payload.targetFinishDate !== undefined) setCell('Target Finish Date', payload.targetFinishDate);

  if (payload.deadlineDelivery !== undefined) {
    setCell('Deadline Delivery', payload.deadlineDelivery);
    setCell('Days Remaining', computeDaysRemaining_(payload.deadlineDelivery));
  }

  if (payload.currentStage !== undefined) {
    setCell('Current Stage', payload.currentStage);
    const weight = STAGE_WEIGHTS[payload.currentStage];
    if (weight !== undefined) setCell('Stage Progress (%)', weight / 100);
  }

  return { poNumber: payload.poNumber };
}

// ------------------------------------------------------------------
// Write: checklist
// ------------------------------------------------------------------
function updateChecklist_(payload) {
  const sheet = getSheet_(SHEET_CHECKLIST);
  const found = findRowByPO_(sheet, payload.poNumber);
  if (!found) throw new Error('Checklist row not found for: ' + payload.poNumber);
  const headers = found.headers;
  const rowIndex = found.rowIndex;

  function setCell(colName, value) {
    const col = headers.indexOf(colName) + 1;
    if (col > 0) sheet.getRange(rowIndex, col).setValue(value);
  }

  const items = payload.items || {};
  let sum = 0, count = 0;
  CHECKLIST_ITEMS.forEach(function (item) {
    if (items[item] !== undefined) {
      setCell(item, items[item]);
    }
  });
  // recompute progress from what's now on the sheet (covers untouched items too)
  const rowVals = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  CHECKLIST_ITEMS.forEach(function (item) {
    const col = headers.indexOf(item);
    const status = rowVals[col];
    if (status && status !== 'N/A' && CHECKLIST_WEIGHTS.hasOwnProperty(status)) {
      sum += CHECKLIST_WEIGHTS[status];
      count++;
    }
  });
  const progress = count > 0 ? Math.round(sum / count) : 0;
  setCell('Progress (%)', progress / 100);
  setCell('Overall Status', progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started');

  // mirror into Project Tracker's Engineering Doc Progress (%)
  const projSheet = getSheet_(SHEET_PROJECTS);
  const projFound = findRowByPO_(projSheet, payload.poNumber);
  if (projFound) {
    const col = projFound.headers.indexOf('Engineering Doc Progress (%)') + 1;
    if (col > 0) projSheet.getRange(projFound.rowIndex, col).setValue(progress / 100);
  }

  return { poNumber: payload.poNumber, progress: progress };
}
