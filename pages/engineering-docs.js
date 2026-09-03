import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function EngineeringDocs() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    api.getProjects().then(setProjects).catch(e => setError(e.message));
  }, []);

  if (error) return <div className="bg-panel border border-line rounded-lg p-6 text-rust">{error}</div>;
  if (!projects) return <div className="text-inkmute">Memuat data dokumen...</div>;

  // Flattening docs data
  let allDocs = [];
  projects.forEach(p => {
    if (p.checklist && p.checklist.items) {
      Object.keys(p.checklist.items).forEach(docName => {
        allDocs.push({
          poNumber: p.poNumber,
          projectName: p.projectName,
          docName: docName,
          status: p.checklist.items[docName],
          link: p.checklist.links?.[docName] || ''
        });
      });
    }
  });

  if (filterStatus !== 'All') {
    allDocs = allDocs.filter(d => d.status === filterStatus);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <h1 className="font-display text-2xl font-semibold text-ink">Engineering Documents</h1>
        <select
          className="border border-line rounded-md px-3 py-2 text-sm bg-panel outline-none focus:border-blueprint"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="All">Semua Status</option>
          <option value="Not Started">Not Started</option>
          <option value="Drafting">Drafting</option>
          <option value="Under Review">Under Review</option>
          <option value="Completed">Completed</option>
          <option value="N/A">N/A</option>
        </select>
      </div>

      <div className="bg-panel border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-canvas/30 text-left text-xs uppercase text-inkmute">
            <tr>
              <th className="px-4 py-3 font-medium">PO Number</th>
              <th className="px-4 py-3 font-medium">Project Name</th>
              <th className="px-4 py-3 font-medium">Dokumen</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tautan</th>
            </tr>
          </thead>
          <tbody>
            {allDocs.map((doc, idx) => (
              <tr key={idx} className="border-b border-line last:border-0 hover:bg-canvas/60">
                <td className="px-4 py-3 font-data text-inkmute">{doc.poNumber}</td>
                <td className="px-4 py-3 font-medium text-ink">{doc.projectName}</td>
                <td className="px-4 py-3 text-ink">{doc.docName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'Completed' ? 'bg-teal/10 text-teal' :
                    doc.status === 'Under Review' ? 'bg-amber/10 text-amber' :
                    doc.status === 'Drafting' ? 'bg-blueprint/10 text-blueprint' :
                    'bg-line/50 text-inkmute'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {doc.link ? (
                    <a href={doc.link} target="_blank" rel="noreferrer" className="text-blueprint hover:underline font-medium">
                      Buka Dokumen ↗
                    </a>
                  ) : (
                    <span className="text-inkmute text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
            {allDocs.length === 0 && (
              <tr><td colSpan="5" className="p-6 text-center text-inkmute">Tidak ada dokumen ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
