import { api } from './api';
import type { Post, CreatePostInput } from '../types';

interface PostsResponse { posts: Post[]; total: number; page: number; limit: number; }
interface GetPostsParams { status?: string; platform?: string; page?: number; limit?: number; from?: string; to?: string; }

export async function getPosts(params?: GetPostsParams): Promise<PostsResponse> {
  const res = await api.get<{ success: true; data: PostsResponse }>('/posts', { params });
  return res.data.data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await api.post<{ success: true; data: { post: Post } }>('/posts', input);
  return res.data.data.post;
}

export async function updatePost(id: string, input: Partial<CreatePostInput>): Promise<Post> {
  const res = await api.put<{ success: true; data: { post: Post } }>(`/posts/${id}`, input);
  return res.data.data.post;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}

export async function publishPost(id: string): Promise<{ post: Post; results: Record<string, unknown> }> {
  const res = await api.post<{ success: true; data: { post: Post; results: Record<string, unknown> } }>(`/posts/${id}/publish`);
  return res.data.data;
}
