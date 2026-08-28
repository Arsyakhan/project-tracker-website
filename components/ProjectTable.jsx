import Link from 'next/link';
import StageGauge from './StageGauge';

const PRIORITY_COLOR = { High: '#B23A2E', Medium: '#C98A2B', Low: '#5C7078' };

export default function ProjectTable({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-panel border border-line rounded-lg p-8 text-center text-inkmute">
        Belum ada project. Tambahkan project pertama kamu.
      </div>
    );
  }
  return (
    <div className="bg-panel border border-line rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-inkmute">
            <th className="px-4 py-3 font-medium">PO</th>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">PIC</th>
            <th className="px-4 py-3 font-medium">Stage</th>
            <th className="px-4 py-3 font-medium w-48">Progress</th>
            <th className="px-4 py-3 font-medium">Priority</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.poNumber} className="border-b border-line last:border-0 hover:bg-canvas/60">
              <td className="px-4 py-3 font-data text-inkmute whitespace-nowrap">{p.poNumber}</td>
              <td className="px-4 py-3">
                <Link href={`/projects/${encodeURIComponent(p.poNumber)}`} className="font-medium text-blueprint hover:underline">
                  {p.projectName}
                </Link>
              </td>
              <td className="px-4 py-3 text-inkmute">{p.client}</td>
              <td className="px-4 py-3 text-inkmute">{p.pic}</td>
              <td className="px-4 py-3 text-inkmute">{p.currentStage}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <StageGauge progress={p.stageProgress} compact showLabel={false} />
                  </div>
                  <span className="text-xs font-medium text-inkmute w-8 text-right">{p.stageProgress}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-medium" style={{ color: PRIORITY_COLOR[p.priority] || '#5C7078' }}>
                  {p.priority}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
