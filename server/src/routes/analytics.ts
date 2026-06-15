import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

function getDateRange(range: string, from?: string, to?: string): { start: Date; end: Date } {
  if (from && to) return { start: new Date(from), end: new Date(to) };
  const end = new Date();
  const start = new Date();
  const days = range === '90d' ? 90 : range === '7d' ? 7 : 30;
  start.setDate(start.getDate() - days);
  return { start, end };
}

router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { range = '30d', from, to } = req.query as Record<string, string>;
    const { start, end } = getDateRange(range, from, to);
    const workspaceId = req.user!.workspaceId;

    const [analyticsRows, postsPublished] = await Promise.all([
      prisma.analytics.findMany({
        where: { workspaceId, date: { gte: start, lte: end } },
      }),
      prisma.post.count({ where: { workspaceId, status: 'PUBLISHED', publishedAt: { gte: start, lte: end } } }),
    ]);

    const sum = (metric: string) =>
      analyticsRows.filter((r) => r.metricType === metric).reduce((acc, r) => acc + r.value, 0);

    const totalReach = sum('reach');
    const totalImpressions = sum('impressions');
    const totalEngagements = sum('engagements');
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
    const followerGrowth = sum('follower_growth');

    const dateMap = new Map<string, { reach: number; impressions: number; engagements: number }>();
    for (const row of analyticsRows) {
      const key = row.date.toISOString().slice(0, 10);
      const existing = dateMap.get(key) ?? { reach: 0, impressions: 0, engagements: 0 };
      if (row.metricType === 'reach') existing.reach += row.value;
      if (row.metricType === 'impressions') existing.impressions += row.value;
      if (row.metricType === 'engagements') existing.engagements += row.value;
      dateMap.set(key, existing);
    }

    const timeSeries = Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, metrics]) => ({ date, ...metrics }));

    return res.json({
      success: true,
      data: {
        summary: {
          totalReach,
          totalImpressions,
          totalEngagements,
          engagementRate: parseFloat(engagementRate.toFixed(2)),
          followerGrowth,
          postsPublished,
        },
        timeSeries,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/meta', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { range = '30d', from, to } = req.query as Record<string, string>;
    const { start, end } = getDateRange(range, from, to);
    const workspaceId = req.user!.workspaceId;

    const rows = await prisma.analytics.findMany({
      where: { workspaceId, platform: 'META', date: { gte: start, lte: end } },
    });

    const sum = (metric: string) =>
      rows.filter((r) => r.metricType === metric).reduce((acc, r) => acc + r.value, 0);

    return res.json({
      success: true,
      data: {
        reach: sum('reach'),
        impressions: sum('impressions'),
        engagements: sum('engagements'),
        followerGrowth: sum('follower_growth'),
        pageViews: sum('page_views'),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/linkedin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { range = '30d', from, to } = req.query as Record<string, string>;
    const { start, end } = getDateRange(range, from, to);
    const workspaceId = req.user!.workspaceId;

    const rows = await prisma.analytics.findMany({
      where: { workspaceId, platform: 'LINKEDIN', date: { gte: start, lte: end } },
    });

    const sum = (metric: string) =>
      rows.filter((r) => r.metricType === metric).reduce((acc, r) => acc + r.value, 0);

    return res.json({
      success: true,
      data: {
        impressions: sum('impressions'),
        clicks: sum('clicks'),
        engagements: sum('engagements'),
        followerGrowth: sum('follower_growth'),
        uniqueVisitors: sum('unique_visitors'),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
