import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProgressChart({ projects }) {
  if (!projects) return null;
  
  // Ambil project yang belum selesai (di bawah 100%), urutkan dari progress tertinggi
  const activeProjects = projects
    .filter(p => p.stageProgress < 100)
    .sort((a, b) => b.stageProgress - a.stageProgress)
    .slice(0, 7); // Ambil 7 teratas agar grafik tidak berdesakan

  return (
    <div className="bg-panel border border-line rounded-lg p-5 h-72">
      <span className="text-xs uppercase tracking-wide text-inkmute font-medium">
        Top Progress Project Aktif
      </span>
      <div className="mt-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeProjects} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="projectName" type="category" width={110} tick={{fontSize: 11, fill: '#5C7078'}} />
            <Tooltip 
              cursor={{fill: '#F2F5F6'}} 
              formatter={(value) => [`${value}%`, 'Progress']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #D7E0E3' }}
            />
            <Bar dataKey="stageProgress" radius={[0, 4, 4, 0]} barSize={14}>
              {activeProjects.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.stageProgress >= 90 ? '#C98A2B' : '#1C4E73'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
