export default function StatCard({ label, value, accent = '#1C4E73' }) {
  return (
    <div className="bg-panel border border-line rounded-lg p-5 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-inkmute font-medium">{label}</span>
      <span className="text-3xl font-display font-semibold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
