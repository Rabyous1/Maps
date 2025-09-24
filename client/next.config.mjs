/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.(ttf|woff|woff2|eot|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    });

    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: {
          not: [...(fileLoaderRule.resourceQuery?.not || []), /url/],
        },
        use: ['@svgr/webpack'],
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     swcMinify: true,
//     images: {
//       remotePatterns: [
//         {
//           protocol: 'http',
//           hostname: 'localhost',
//           port: '4000',
//           pathname: '/uploads/**',
//         },
//       ],
//     },
  
//     webpack(config) {
//       const fileLoaderRule = config.module.rules.find((rule) =>
//         rule.test?.test?.('.svg')
//       );
  
//       config.module.rules.push(
//         {
//           ...fileLoaderRule,
//           test: /\.svg$/i,
//           resourceQuery: /url/,
//         },
//         {
//           test: /\.svg$/i,
//           issuer: fileLoaderRule.issuer,
//           resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
//           use: ['@svgr/webpack'], 
//         }
//       );
  
//       fileLoaderRule.exclude = /\.svg$/i;
  
//       return config;
//     },
//   };
  
//   export default nextConfig;
  
// /*
// /** @type {import('next').NextConfig} 
// const nextConfig = {
//     swcMinify: true, 
// };

// export default nextConfig;
// */