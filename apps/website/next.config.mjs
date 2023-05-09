//@ts-check

import { withNx } from '@nx/next/plugins/with-nx.js';
import createWithMDX from '@next/mdx';

const withMDX = createWithMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withNx(
  withMDX({
    webpack5: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    nx: {
      svgr: false,
    },
    async redirects() {
      return [
        {
          source: '/privacy-policy',
          destination: 'https://www.boredgen.net/wallet/privacy-policy',
          permanent: true,
        },
        {
          source: '/terms-and-conditions',
          destination: 'https://www.boredgen.net/wallet/terms-and-conditions',
          permanent: true,
        },
      ];
    },
  }),
);
