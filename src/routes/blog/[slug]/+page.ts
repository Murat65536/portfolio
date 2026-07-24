import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { BlogPost } from '$lib/types';

const posts = import.meta.glob<{ metadata: Omit<BlogPost, 'slug'> }>('/src/lib/posts/*.md', { eager: true });

export const load: PageLoad = ({ params }) => {
  const post = posts[`/src/lib/posts/${params.slug}.md`];
  if (!post) error(404, `Could not find blog post ${params.slug}`);

  return { slug: params.slug, meta: post.metadata };
};
