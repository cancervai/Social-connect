import { useEffect, useState } from 'react';
import { Plus, Send, Clock, FileText, AlertCircle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TopBar } from '../components/layout/TopBar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { formatDateTime, truncate } from '../utils/formatters';
import { getPosts, createPost, deletePost, publishPost } from '../services/postsService';
import type { Post, PostStatus, Platform } from '../types';

const statusVariant: Record<PostStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  PUBLISHED: 'success',
  SCHEDULED: 'warning',
  DRAFT: 'neutral',
  FAILED: 'error',
};

const statusIcon: Record<PostStatus, React.ReactNode> = {
  PUBLISHED: <Send size={12} />,
  SCHEDULED: <Clock size={12} />,
  DRAFT: <FileText size={12} />,
  FAILED: <AlertCircle size={12} />,
};

export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['META', 'LINKEDIN']);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPosts({ limit: 20 });
      setPosts(data.posts);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const handleCreate = async () => {
    if (!content.trim() || platforms.length === 0) return;
    setSubmitting(true);
    try {
      await createPost({ content, platforms, status: 'DRAFT' });
      setContent('');
      setComposerOpen(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    await publishPost(id);
    await load();
  };

  const handleDelete = async (id: string) => {
    await deletePost(id);
    await load();
  };

  return (
    <AppShell>
      <TopBar title="Posts" onNewPost={() => setComposerOpen(true)} />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-text-muted">{total} total posts</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <Card className="flex flex-col items-center py-16 text-center">
            <FileText size={32} className="text-text-muted mb-3" />
            <p className="text-text-primary font-medium mb-1">No posts yet</p>
            <p className="text-sm text-text-muted mb-4">Create your first post to get started</p>
            <Button icon={<Plus size={14} />} onClick={() => setComposerOpen(true)}>New Post</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary mb-2">{truncate(post.content, 120)}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={statusVariant[post.status]}>
                        <span className="flex items-center gap-1">
                          {statusIcon[post.status]} {post.status}
                        </span>
                      </Badge>
                      {post.platforms.map((p) => (
                        <Badge key={p} variant={p === 'META' ? 'info' : 'cyan'}>{p}</Badge>
                      ))}
                      {post.scheduledAt && (
                        <span className="text-xs text-text-muted">
                          Scheduled: {formatDateTime(post.scheduledAt)}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="text-xs text-text-muted">
                          Published: {formatDateTime(post.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {['DRAFT', 'SCHEDULED'].includes(post.status) && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => handlePublish(post.id)}>
                          Publish now
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={composerOpen} onClose={() => setComposerOpen(false)} title="Compose Post" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">Platforms</label>
            <div className="flex gap-2">
              {(['META', 'LINKEDIN'] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={[
                    'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                    platforms.includes(p)
                      ? p === 'META' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-linkedin/10 text-linkedin border-linkedin/30'
                      : 'bg-transparent text-text-muted border-border hover:border-border-strong',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              rows={6}
              maxLength={3000}
              className="w-full rounded-md border border-border bg-raised text-text-primary text-sm p-3 placeholder:text-text-muted focus:outline-none focus:border-border-strong resize-none"
            />
            <p className="text-xs text-text-muted mt-1 text-right">{content.length}/3000</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setComposerOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              loading={submitting}
              disabled={!content.trim() || platforms.length === 0}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
