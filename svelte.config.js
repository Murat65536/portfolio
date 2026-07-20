import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      rehypePlugins: [
        () => (tree) => {
          const visit = (node) => {
            if (node.tagName === 'a') {
              node.properties.target = '_blank';
              node.properties.rel = 'noopener noreferrer';
            }
            node.children?.forEach(visit);
          };
          visit(tree);
        }
      ]
    })
  ],
  kit: {
    adapter: adapter()
  }
};

export default config;