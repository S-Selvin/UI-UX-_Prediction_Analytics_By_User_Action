interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
}

export function KPICard({ title, value, description }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-500 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}
