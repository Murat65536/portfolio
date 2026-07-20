import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { BlogPost } from '$lib/types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`../../../lib/posts/${params.slug}.md`) as {
      default: Component;
      metadata: Omit<BlogPost, 'slug'>;
    };
    
    return {
      content: post.default,
      meta: post.metadata
    };
  } catch (e) {
    throw error(404, `Could not find blog post ${params.slug}`);
  }
};
