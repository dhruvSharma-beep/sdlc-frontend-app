'use client';
import { memo, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';

const StatCard = memo(({ label, value, sub, danger }: { label: string; value: React.ReactNode; sub?: string; danger?: boolean }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className={`mt-1 text-3xl font-bold ${danger ? 'text-red-500' : 'text-gray-900'}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
  </div>
));
StatCard.displayName = 'StatCard';

const PRRow = memo(({ pr }: { pr: { id: string; title: string; riskScore: number | null; repo: { repoName: string }; branch: string } }) => {
  const risk = pr.riskScore;
  const badge = risk === null ? 'bg-gray-100 text-gray-500' : risk >= 70 ? 'bg-red-100 text-red-700' : risk >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  return (
    <a href={`/prs/${pr.id}`} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{pr.title}</p>
        <p className="text-xs text-gray-400">{pr.repo.repoName} · {pr.branch}</p>
      </div>
      <span className={`ml-3 flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
        {risk === null ? 'Not analysed' : `Risk ${risk}`}
      </span>
    </a>
  );
});
PRRow.displayName = 'PRRow';

export function Dashboard() {
  const { stats, openPRs, recentReleases, loading, error } = useDashboardData();
  const highRisk = useMemo(() => openPRs.filter(p => (p.riskScore ?? 0) >= 70), [openPRs]);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100" />)}
      </div>
      <div className="h-64 rounded-xl bg-gray-100" />
    </div>
  );
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Open PRs"      value={stats?.openPRs ?? 0}       sub={`${stats?.totalRepos ?? 0} repos`} />
        <StatCard label="High Risk"     value={highRisk.length}           sub="Risk score ≥ 70" danger={highRisk.length > 0} />
        <StatCard label="Not Analysed"  value={stats?.unanalyzedPRs ?? 0} sub="Pending AI review" />
        <StatCard label="Avg Risk"      value={stats?.avgRisk !== null ? `${stats?.avgRisk}/100` : '—'} />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700">Open Pull Requests</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {openPRs.length === 0 ? <p className="px-5 py-8 text-center text-sm text-gray-400">No open PRs</p>
            : openPRs.map(pr => <PRRow key={pr.id} pr={pr} />)}
        </div>
      </div>
    </div>
  );
}