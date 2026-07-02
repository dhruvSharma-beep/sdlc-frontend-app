import { useState, useEffect } from 'react';

interface DashboardData {
  stats: Record<string, number>;
  prs: Array<{ id: string; title: string; riskScore: number }>;
  releases: Array<{ id: string; releaseName: string; status: string }>;
  loading: boolean;
}

export function useDashboardData(userId: string): DashboardData {
  const [data, setData] = useState<DashboardData>({ stats: {}, prs: [], releases: [], loading: true });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/dashboard/insights').then(r => r.json()),
      fetch('/api/github/pulls').then(r => r.json()),
      fetch('/api/releases/list').then(r => r.json()),
    ]).then(([insights, prsData, relsData]) => {
      if (!cancelled) setData({ stats: insights.stats ?? {}, prs: prsData.prs ?? [], releases: relsData.releases ?? [], loading: false });
    });
    return () => { cancelled = true; };
  }, [userId]);

  return data;
}
