import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const EloGraph = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <XAxis dataKey="date" hide />
      <YAxis domain={['auto', 'auto']} hide />
      <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
      <Line type="monotone" dataKey="elo" stroke="#3b82f6" strokeWidth={3} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);
