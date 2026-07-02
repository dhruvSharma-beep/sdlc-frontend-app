import React, { memo, useMemo, useCallback } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

interface DashboardProps { userId: string; role: string; }

export const Dashboard = memo(({ userId, role }: DashboardProps) => {
  const { stats, prs, releases, loading } = useDashboardData(userId);

  const criticalPRs = useMemo(() => prs.filter(p => p.riskScore >= 70), [prs]);
  const onPRClick   = useCallback((id: string) => { window.location.href = `/prs/${id}`; }, []);

  if (loading) return <div className="skeleton h-64 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><p>Open PRs</p><p className="text-2xl font-bold">{stats.openPRs}</p></div>
        <div className="stat-card"><p>High Risk</p><p className="text-2xl font-bold text-red-500">{criticalPRs.length}</p></div>
        <div className="stat-card"><p>Releases</p><p className="text-2xl font-bold">{stats.totalReleases}</p></div>
      </div>
      <ul>{prs.map(p => <li key={p.id} onClick={() => onPRClick(p.id)} className="cursor-pointer">{p.title}</li>)}</ul>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
