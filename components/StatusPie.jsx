import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = { 'Pre-Delivery': '#1C4E73', 'Delivered': '#C98A2B', 'Completed': '#3F8361' };

export default function StatusPie({ dashboard }) {
  if (!dashboard) return null;
  const data = [
    { name: 'Pre-Delivery', value: dashboard.preDelivery },
    { name: 'Delivered', value: dashboard.delivered },
    { name: 'Completed', value: dashboard.completed }
  ];
  return (
    <div className="bg-panel border border-line rounded-lg p-5 h-72">
      <span className="text-xs uppercase tracking-wide text-inkmute font-medium">
        Distribusi Status Project
      </span>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
