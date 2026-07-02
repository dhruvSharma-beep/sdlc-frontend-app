import { useState, useEffect, useRef } from 'react';

export interface DashboardStats {
  openPRs: number; highRiskPRs: number; unanalyzedPRs: number;
  totalReleases: number; draftReleases: number; avgRisk: number | null;
  prsWithJira: number; totalRepos: number;
}
export interface PRSummary { id: string; title: string; branch: string; riskScore: number | null; aiSummary: string | null; status: string; repo: { repoName: string }; }
export interface ReleaseSummary { id: string; releaseName: string; status: string; riskScore: number | null; createdAt: string; }

export interface DashboardData { stats: DashboardStats | null; openPRs: PRSummary[]; recentReleases: ReleaseSummary[]; loading: boolean; error: string | null; }

const EMPTY: DashboardData = { stats: null, openPRs: [], recentReleases: [], loading: true, error: null };

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setData(d => ({ ...d, loading: true, error: null }));

    Promise.all([
      fetch('/api/dashboard/insights', { signal: ctrl.signal }).then(r => r.json()),
      fetch('/api/github/pulls',       { signal: ctrl.signal }).then(r => r.json()),
      fetch('/api/releases/list',      { signal: ctrl.signal }).then(r => r.json()),
    ]).then(([ins, prsRes, relsRes]) => {
      if (!ctrl.signal.aborted) {
        setData({ stats: ins.stats ?? null, openPRs: (prsRes.prs ?? []).filter((p: PRSummary) => p.status === 'open'), recentReleases: relsRes.releases ?? [], loading: false, error: null });
      }
    }).catch(err => {
      if (err.name !== 'AbortError') setData(d => ({ ...d, loading: false, error: 'Failed to load dashboard data' }));
    });

    return () => ctrl.abort();
  }, []);

  return data;
}