import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ProjectTable from '../../components/ProjectTable';

export default function AllProjectsPage() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProjects().then(setProjects).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="bg-panel border border-line rounded-lg p-6 text-rust">Gagal memuat data: {error}</div>;
  if (!projects) return <div className="text-inkmute">Memuat data dari spreadsheet...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Semua Project</h1>
      <ProjectTable projects={projects} />
    </div>
  );
}
