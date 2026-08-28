export default function Timeline({ projects }) {
  if (!projects) return null;

  // Ambil project aktif yang punya deadline, urutkan dari tanggal terdekat
  const upcoming = [...projects]
    .filter(p => p.stageProgress < 100 && p.deadlineDelivery)
    .sort((a, b) => new Date(a.deadlineDelivery) - new Date(b.deadlineDelivery))
    .slice(0, 6);

  return (
    <div className="bg-panel border border-line rounded-lg p-5 h-72 overflow-y-auto">
      <span className="text-xs uppercase tracking-wide text-inkmute font-medium">
        Timeline & Deadline Terdekat
      </span>
      <div className="mt-5 flex flex-col gap-4 relative">
        {/* Garis vertikal timeline */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-line"></div>

        {upcoming.length === 0 ? (
          <div className="text-sm text-inkmute pl-6">Tidak ada deadline terdekat.</div>
        ) : (
          upcoming.map((p) => {
            const days = p.daysRemaining;
            const isWarning = days !== '' && days <= 14; // Merah jika deadline <= 14 hari

            return (
              <div key={p.poNumber} className="relative pl-6">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-panel ${isWarning ? 'bg-rust' : 'bg-blueprint'}`}></div>
                <div className="text-sm font-medium text-ink truncate" title={p.projectName}>{p.projectName}</div>
                <div className={`text-xs mt-0.5 font-medium ${isWarning ? 'text-rust' : 'text-blueprint'}`}>
                  Deadline: {p.deadlineDelivery} {days !== '' && `(${days} hari lagi)`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
