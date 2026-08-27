import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import ProjectTable from '../../components/ProjectTable';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getProjects().then(setProjects).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="text-rust">Gagal memuat data: {error}</div>;
  if (!projects) return <div className="text-inkmute">Memuat...</div>;

  const filtered = projects.filter((p) =>
    `${p.projectName} ${p.client} ${p.poNumber} ${p.pic}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Semua Project</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari project, client, PIC..."
          className="border border-line rounded-md px-3 py-2 text-sm w-64 bg-panel"
        />
      </div>
      <ProjectTable projects={filtered} />
    </div>
  );
}
