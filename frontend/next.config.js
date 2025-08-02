/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@solana/wallet-adapter-base', '@solana/wallet-adapter-react'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        'follow-redirects': false,
        'form-data': false,
      };
    }

    // Ignorar warnings de módulos críticos
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { file: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/follow-redirects/ },
      { module: /node_modules\/form-data/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // Alias para módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
      'follow-redirects': false,
      'form-data': false,
    };

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;
