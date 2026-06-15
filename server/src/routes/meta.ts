import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import * as metaService from '../services/metaService';
import { env } from '../config/env';

const router = Router();

const stateStore = new Map<string, string>();

router.get('/oauth/url', authenticate, (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, req.user!.workspaceId);
  setTimeout(() => stateStore.delete(state), 10 * 60 * 1000);

  const url = metaService.buildMetaOAuthUrl(state);
  return res.json({ success: true, data: { url } });
});

router.get('/oauth/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const workspaceId = stateStore.get(state);
    if (!workspaceId) {
      return res.redirect(`${env.CLIENT_URL}/onboarding?error=invalid_state`);
    }
    stateStore.delete(state);

    const tokenData = await metaService.exchangeCodeForToken(code);
    const pages = await metaService.getPages(tokenData.access_token);
    const firstPage = pages[0];

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null;

    await prisma.socialAccount.upsert({
      where: { workspaceId_platform: { workspaceId, platform: 'META' } },
      create: {
        workspaceId,
        platform: 'META',
        accessToken: tokenData.access_token,
        expiresAt,
        pageId: firstPage?.id,
        pageName: firstPage?.name,
      },
      update: {
        accessToken: tokenData.access_token,
        expiresAt,
        pageId: firstPage?.id,
        pageName: firstPage?.name,
      },
    });

    return res.redirect(`${env.CLIENT_URL}/onboarding?connected=meta`);
  } catch (err) {
    next(err);
  }
});

router.get('/pages', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { workspaceId_platform: { workspaceId: req.user!.workspaceId, platform: 'META' } },
    });
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Meta account not connected' },
      });
    }
    const pages = await metaService.getPages(account.accessToken);
    return res.json({ success: true, data: { pages } });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({
  businessName: z.string().min(1),
  address: z.string().min(1),
  country: z.string().length(2),
  verificationMethod: z.enum(['BUSINESS_DOCUMENTS', 'DOMAIN']),
  documents: z
    .array(z.object({ type: z.string(), fileUrl: z.string().url() }))
    .optional(),
});

router.post('/verify', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = verifySchema.parse(req.body);
    await prisma.workspace.update({
      where: { id: req.user!.workspaceId },
      data: { verificationStatus: 'PENDING' },
    });
    return res.json({
      success: true,
      data: {
        verificationId: crypto.randomUUID(),
        status: 'PENDING',
        estimatedDays: '2-5',
        submittedData: body,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/verify/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.user!.workspaceId },
      select: { verificationStatus: true },
    });
    return res.json({ success: true, data: { status: workspace?.verificationStatus ?? 'NOT_STARTED' } });
  } catch (err) {
    next(err);
  }
});

export default router;
