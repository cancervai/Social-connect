import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/authenticate';
import * as linkedinService from '../services/linkedinService';
import { env } from '../config/env';

const router = Router();

const stateStore = new Map<string, string>();

router.get('/oauth/url', authenticate, (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, req.user!.workspaceId);
  setTimeout(() => stateStore.delete(state), 10 * 60 * 1000);

  const url = linkedinService.buildLinkedInOAuthUrl(state);
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

    const tokenData = await linkedinService.exchangeCodeForToken(code);
    const profile = await linkedinService.getProfile(tokenData.access_token);

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await prisma.socialAccount.upsert({
      where: { workspaceId_platform: { workspaceId, platform: 'LINKEDIN' } },
      create: {
        workspaceId,
        platform: 'LINKEDIN',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        pageId: profile.id,
        profileName: `${profile.firstName} ${profile.lastName}`,
        profileImage: profile.profilePictureUrl,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        pageId: profile.id,
        profileName: `${profile.firstName} ${profile.lastName}`,
        profileImage: profile.profilePictureUrl,
      },
    });

    return res.redirect(`${env.CLIENT_URL}/onboarding?connected=linkedin`);
  } catch (err) {
    next(err);
  }
});

router.get('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { workspaceId_platform: { workspaceId: req.user!.workspaceId, platform: 'LINKEDIN' } },
    });
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'LinkedIn account not connected' },
      });
    }
    return res.json({
      success: true,
      data: {
        id: account.pageId,
        name: account.profileName,
        profilePictureUrl: account.profileImage,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
