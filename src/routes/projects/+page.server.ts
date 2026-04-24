import type { PageServerLoad } from './$types';
import type { Project } from '$lib/types';

export const load: PageServerLoad = async () => {
  const paths = import.meta.glob('/src/lib/projects/*.md', { eager: true });
  
  const projects: Project[] = Object.entries(paths).map(([path, file]) => {
    const slug = path.split('/').pop()?.split('.md')[0] || '';
    const metadata = (file as { metadata: Omit<Project, 'slug'> }).metadata;
    
    return {
      slug,
      title: metadata?.title || 'Untitled',
      description: metadata?.description || 'No description provided.',
      date: metadata?.date || 'Unknown date'
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { projects };
};