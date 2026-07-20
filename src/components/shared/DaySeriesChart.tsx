import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function DaySeriesChart({
  data,
  dataKey = 'count',
  label = 'Count',
}: {
  data: Array<Record<string, unknown>>
  dataKey?: string
  label?: string
}) {
  if (!data.length) {
    return <p className="text-sm text-text-muted">No series data for this period.</p>
  }

  const chartData = data.map((row) => ({
    day: String(row.day ?? ''),
    value: Number(row[dataKey] ?? 0),
  }))

  return (
    <div className="h-64 w-full rounded-2xl border border-border/70 bg-surface shadow-[var(--shadow-soft)] p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e5ea" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" name={label} stroke="#DB6815" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
