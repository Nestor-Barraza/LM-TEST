const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 's3.us-east-005.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: 'smsgadget.com',
      },
      {
        protocol: 'http',
        hostname: 'www.istudio.store',
      },
      {
        protocol: 'https',
        hostname: 'www.mobiledokan.co',
      },
      {
        protocol: 'https',
        hostname: 'macspace.vn',
      },
      {
        protocol: 'https',
        hostname: 'pisces.bbystatic.com',
      },
      {
        protocol: 'https',
        hostname: 'd1ncau8tqf99kp.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'i1.adis.ws',
      },
      {
        protocol: 'https',
        hostname: 'dji-retail.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
      },
      {
        protocol: 'https',
        hostname: 'images.samsung.com',
      },
      {
        protocol: 'https',
        hostname: 'dyson-h.assetsadobe2.com',
      },
      {
        protocol: 'https',
        hostname: 'static.nike.com',
      },
      {
        protocol: 'https',
        hostname: 'f005.backblazeb2.com',
      },
    ],
  },
};

module.exports = nextConfig;
