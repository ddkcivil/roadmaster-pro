import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, LucideIcon } from 'lucide-react';
import { Project } from '../types';

interface Props {
  project: Project;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: LucideIcon;
  colorClass: string;
}

const Dashboard: React.FC<Props> = ({ project }) => {
  const totalRFIs = project.rfis.length;
  const openRFIs = project.rfis.filter(r => r.status === 'Open').length;
  const totalTests = project.labTests.length;
  const passedTests = project.labTests.filter(t => t.result === 'Pass').length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const totalValue = project.boq.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const completedValue = project.boq.reduce((acc, item) => acc + (item.completedQuantity * item.rate), 0);
  const physicalProgress = totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0;

  const isProj1 = project.id === 'proj-001';
  const progressData = isProj1 ? [
    { name: 'Month 1', planned: 10, actual: 8 },
    { name: 'Month 2', planned: 25, actual: 20 },
    { name: 'Month 3', planned: 45, actual: 35 },
    { name: 'Month 4', planned: 60, actual: 50 },
    { name: 'Month 5', planned: 75, actual: 62 },
    { name: 'Month 6', planned: 90, actual: 80 },
  ] : [
    { name: 'Month 1', planned: 5, actual: 4 },
    { name: 'Month 2', planned: 15, actual: 10 },
    { name: 'Month 3', planned: 25, actual: 15 },
  ];

  const categories = Array.from(new Set(project.boq.map(b => b.category)));
  const financialData = categories.map(cat => ({
    name: cat,
    amount: project.boq.filter(b => b.category === cat).reduce((acc, b) => acc + (b.completedQuantity * b.rate), 0)
  }));

  const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon: Icon, colorClass }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{title}</span>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{trend}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Physical Progress" 
          value={`${physicalProgress}%`} 
          trend="Cumulative" 
          icon={TrendingUp} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Open RFIs" 
          value={openRFIs} 
          trend={`${totalRFIs} Total raised`} 
          icon={Clock} 
          colorClass="bg-amber-500" 
        />
        <StatCard 
          title="Tests Passed" 
          value={`${passRate}%`} 
          trend={`${passedTests} / ${totalTests} Tests`} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500" 
        />
        <StatCard 
          title="Pending Issues" 
          value={project.schedule.filter(s => s.status === 'Delayed').length} 
          trend="Delayed Tasks" 
          icon={AlertTriangle} 
          colorClass="bg-rose-500" 
        />
        <StatCard
          title="Low Stock Materials"
          value={project.inventory
            .filter(item => item.category === 'Materials' && item.minStock && item.quantity < item.minStock)
            .length}
          trend={`Total Material Items: ${project.inventory.filter(item => item.category === 'Materials').length}`}
          icon={AlertTriangle}
          colorClass="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Planned vs Actual Progress</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {progressData.length > 0 ? (
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    tick={{fill: 'var(--text)', fontSize: 12}}
                    interval={0}
                    height={30}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text)', fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="planned" stroke="var(--secondary)" strokeWidth={3} strokeDasharray="5 5" name="Planned %" />
                  <Line type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={3} name="Actual %" />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No progress data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Financial Work Done</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {financialData.length > 0 ? (
                <BarChart data={financialData} layout="vertical" margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{fill: 'var(--text)', fontSize: 12}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${project.currency}${value.toLocaleString()}`, 'Amount']}
                    cursor={{fill: 'var(--background)'}}
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={20} name={`Amount (${project.currency})`} />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No financial data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
