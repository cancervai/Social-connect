import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId };
    if (source) where.source = source;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.lead.count({ where }),
    ]);

    return res.json({ success: true, data: { leads, total, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }
    return res.json({ success: true, data: { lead } });
  } catch (err) {
    next(err);
  }
});

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED']).optional(),
  notes: z.string().optional(),
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateLeadSchema.parse(req.body);
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }
    const updated = await prisma.lead.update({ where: { id: req.params.id }, data: body });
    return res.json({ success: true, data: { lead: updated } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!lead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }
    await prisma.lead.delete({ where: { id: req.params.id } });
    return res.json({ success: true, data: { message: 'Lead deleted' } });
  } catch (err) {
    next(err);
  }
});

router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;

    // TODO: Implement actual sync from Meta Lead Ads and LinkedIn Lead Gen Forms.
    // Use metaService.getLeadForms() and metaService.getLeadsFromForm() for Meta.
    // Use linkedinService.getLeadGenForms() for LinkedIn.
    // Upsert each lead with prisma.lead.upsert() using externalId + source as unique key.

    return res.json({
      success: true,
      data: {
        synced: { meta: 0, linkedin: 0 },
        total: 0,
        lastSyncedAt: new Date().toISOString(),
        message: 'Sync logic not yet implemented. See TODO in leads route.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
