import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { platform, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId };
    if (platform) where.platform = platform;
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.campaign.count({ where }),
    ]);

    return res.json({ success: true, data: { campaigns, total, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!campaign) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    }
    return res.json({ success: true, data: { campaign } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!campaign) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    }

    // TODO: Fetch time-series metrics from Meta / LinkedIn API using campaign.externalId
    // For Meta: metaService.getCampaignInsights(campaign.externalId, accessToken)
    // For LinkedIn: linkedinService.getCampaignInsights(accessToken, campaign.externalId)
    // Return structured timeSeries array

    return res.json({
      success: true,
      data: {
        campaign: { id: campaign.id, name: campaign.name, platform: campaign.platform },
        timeSeries: [],
        note: 'Time-series metrics not yet implemented. See TODO in campaigns route.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
