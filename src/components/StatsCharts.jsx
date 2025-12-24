import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#00f0ff', '#7000df', '#39ff14', '#ea0b5a']; // Primary, Secondary, Accent

const StatsCharts = ({ expenses, winStats }) => {
    
    // Transform expense data for Pie Chart
    const expenseData = Object.entries(expenses.byPlayer).map(([name, value]) => ({
        name,
        value
    })).sort((a, b) => b.value - a.value);

    // Transform win stats for Bar Chart
    const winData = winStats.map(p => ({
        name: p.name,
        wins: p.wins,
        losses: p.losses
    }));

    return (
        <div className="grid md:grid-cols-2 gap-6 my-8">
            {/* Expense Distribution */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4 w-full text-left">Expense Share</h3>
                <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={expenseData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {expenseData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0a0a16', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value), 'Spent']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-4 flex-wrap justify-center mt-4">
                    {expenseData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            {entry.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Win/Loss Ratio */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4">Win/Loss Metrics</h3>
                <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={winData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} />
                            <YAxis stroke="#666" tick={{ fill: '#888' }} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#0a0a16', borderColor: '#333', borderRadius: '8px' }}
                            />
                            <Bar dataKey="wins" fill="var(--color-primary)" radius={[4, 4, 0, 0]} stackId="a" />
                            <Bar dataKey="losses" fill="#333" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsCharts;
