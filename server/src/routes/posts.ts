import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import * as metaService from '../services/metaService';
import * as linkedinService from '../services/linkedinService';

const router = Router();
router.use(authenticate);

const postSchema = z.object({
  content: z.string().min(1).max(3000),
  platforms: z.array(z.enum(['META', 'LINKEDIN'])).min(1),
  status: z.enum(['DRAFT', 'SCHEDULED']).default('DRAFT'),
  scheduledAt: z.string().datetime().optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, platform, page = '1', limit = '20', from, to } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId };
    if (status) where.status = status;
    if (platform) where.platforms = { has: platform };
    if (from || to) {
      where.scheduledAt = {};
      if (from) (where.scheduledAt as Record<string, unknown>).gte = new Date(from);
      if (to) (where.scheduledAt as Record<string, unknown>).lte = new Date(to);
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.post.count({ where }),
    ]);

    return res.json({ success: true, data: { posts, total, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = postSchema.parse(req.body);
    const post = await prisma.post.create({
      data: {
        content: body.content,
        platforms: body.platforms,
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        workspaceId: req.user!.workspaceId,
      },
    });
    return res.status(201).json({ success: true, data: { post } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    }
    if (!['DRAFT', 'SCHEDULED'].includes(existing.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only draft or scheduled posts can be edited' },
      });
    }

    const body = postSchema.partial().parse(req.body);
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
    });
    return res.json({ success: true, data: { post } });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.post.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    }
    if (!['DRAFT', 'SCHEDULED'].includes(existing.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only draft or scheduled posts can be deleted' },
      });
    }
    await prisma.post.delete({ where: { id: req.params.id } });
    return res.json({ success: true, data: { message: 'Post deleted' } });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/publish', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findFirst({
      where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    });
    if (!post) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    }

    const results: Record<string, unknown> = {};
    const workspaceId = req.user!.workspaceId;

    if (post.platforms.includes('META')) {
      const metaAccount = await prisma.socialAccount.findUnique({
        where: { workspaceId_platform: { workspaceId, platform: 'META' } },
      });
      if (metaAccount?.pageId) {
        try {
          const result = await metaService.publishToPage(
            metaAccount.pageId,
            metaAccount.accessToken,
            post.content
          );
          results.meta = { success: true, postId: result.id };
        } catch (e) {
          results.meta = { success: false, error: (e as Error).message };
        }
      } else {
        results.meta = { success: false, error: 'Meta account not connected' };
      }
    }

    if (post.platforms.includes('LINKEDIN')) {
      const liAccount = await prisma.socialAccount.findUnique({
        where: { workspaceId_platform: { workspaceId, platform: 'LINKEDIN' } },
      });
      if (liAccount?.pageId) {
        try {
          const result = await linkedinService.sharePost(
            liAccount.accessToken,
            `urn:li:person:${liAccount.pageId}`,
            post.content
          );
          results.linkedin = { success: true, activityUrn: result.id };
        } catch (e) {
          results.linkedin = { success: false, error: (e as Error).message };
        }
      } else {
        results.linkedin = { success: false, error: 'LinkedIn account not connected' };
      }
    }

    const allSucceeded = Object.values(results).every((r) => (r as { success: boolean }).success);
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: { status: allSucceeded ? 'PUBLISHED' : 'FAILED', publishedAt: new Date() },
    });

    return res.json({ success: true, data: { post: updatedPost, results } });
  } catch (err) {
    next(err);
  }
});

export default router;
