import type { PageServerLoad } from './$types';
import type { BlogPost } from '$lib/types';

export const load: PageServerLoad = async () => {
  const paths = import.meta.glob('/src/lib/posts/*.md', { eager: true });
  
  const posts: BlogPost[] = Object.entries(paths).map(([path, file]) => {
    const slug = path.split('/').pop()?.split('.md')[0] || '';
    const metadata = (file as { metadata: Omit<BlogPost, 'slug'> }).metadata;
    
    return {
      slug,
      title: metadata?.title || 'Untitled',
      description: metadata?.description || 'No description provided.',
      date: metadata?.date || 'Unknown date'
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { posts };
};
