import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Project } from '$lib/types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ params }) => {
  try {
    const post = await import(`../../../lib/projects/${params.slug}.md`) as {
      default: Component;
      metadata: Omit<Project, 'slug'>;
    };
    
    return {
      content: post.default,
      meta: post.metadata
    };
  } catch (e) {
    throw error(404, `Could not find project ${params.slug}`);
  }
};