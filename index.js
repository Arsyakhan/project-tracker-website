import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import StatCard from '../components/StatCard';
import StatusPie from '../components/StatusPie';
import ProjectTable from '../components/ProjectTable';

export default function Dashboard() {
  const [projects, setProjects] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const [p, d] = await Promise.all([api.getProjects(), api.getDashboard()]);
      setProjects(p);
      setDashboard(d);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <div className="bg-panel border border-line rounded-lg p-6 text-rust">
        Gagal memuat data: {error}. Pastikan NEXT_PUBLIC_API_URL sudah benar dan Apps Script sudah di-deploy.
      </div>
    );
  }

  if (!projects) {
    return <div className="text-inkmute">Memuat data dari spreadsheet...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard Progress</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Project" value={dashboard.total} accent="#152631" />
        <StatCard label="Pre-Delivery" value={dashboard.preDelivery} accent="#1C4E73" />
        <StatCard label="Delivered" value={dashboard.delivered} accent="#C98A2B" />
        <StatCard label="Completed" value={dashboard.completed} accent="#3F8361" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <StatusPie dashboard={dashboard} />
        </div>
        <div className="md:col-span-2">
          <div className="bg-panel border border-line rounded-lg p-5 h-72 overflow-y-auto">
            <span className="text-xs uppercase tracking-wide text-inkmute font-medium">
              Project Perlu Perhatian (Priority Tinggi)
            </span>
            <ul className="mt-3 flex flex-col gap-3">
              {projects
                .filter((p) => p.priority === 'High' && p.stageProgress < 100)
                .map((p) => (
                  <li key={p.poNumber} className="text-sm">
                    <span className="font-medium text-ink">{p.projectName}</span>{' '}
                    <span className="text-inkmute">— {p.currentStage} ({p.stageProgress}%)</span>
                  </li>
                ))}
              {projects.filter((p) => p.priority === 'High' && p.stageProgress < 100).length === 0 && (
                <li className="text-sm text-inkmute">Tidak ada project prioritas tinggi yang aktif.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Semua Project</h2>
        <ProjectTable projects={projects} />
      </div>
    </div>
  );
}
