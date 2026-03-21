/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'react-markdown', 'remark-gfm',
    'remark-parse', 'remark-rehype', 'rehype-stringify', 'unified',
    'vfile', 'vfile-message', 'unist-util-stringify-position',
    'mdast-util-from-markdown', 'mdast-util-to-hast',
    'micromark', 'decode-named-character-reference', 'character-entities',
    'hast-util-to-jsx-runtime', 'hast-util-whitespace',
    'property-information', 'space-separated-tokens', 'comma-separated-tokens',
    'estree-util-is-identifier-name', 'html-url-attributes',
    'zwitch', 'ccount', 'escape-string-regexp',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;