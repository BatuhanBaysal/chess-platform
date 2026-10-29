import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface MatchDistributionItem {
    name: string;
    value: number;
    fill: string;
    [key: string]: any;
}

const renderLegendText = (value: string) => (
    <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>
);

export const MatchDistributionGraph = ({ data }: { data: MatchDistributionItem[] }) => {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie 
                    data={data} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={8} 
                    cornerRadius={4} 
                    dataKey="value"
                    stroke="none"
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #1e293b', 
                        borderRadius: '8px', 
                        fontSize: '11px',
                        color: '#f8fafc'
                    }} 
                />
                <Legend 
                    height={36} 
                    iconType="circle"
                    formatter={renderLegendText}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};
