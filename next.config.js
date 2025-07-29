/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone mode for Docker deployment
  output: 'standalone',
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    domains: [
      'portal.namcnorcal.org',
      'staging.namcnorcal.org',
      'dev.namcnorcal.org',
      'localhost'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Security headers
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          // HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          // Prevent XSS
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // API security headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      },
      // Static file caching
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]

    // Add CSP header only in production
    if (process.env.NODE_ENV === 'production') {
      headers[0].headers.push({
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https:",
          "connect-src 'self' https://api.hubapi.com https://www.google-analytics.com",
          "frame-src 'none'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join('; ')
      })
    }

    return headers
  },
  
  // Redirects
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.portal.namcnorcal.org',
          },
        ],
        destination: 'https://portal.namcnorcal.org/:path*',
        permanent: true,
      },
      // Legacy routes - removed members redirect as we have a members page
      {
        source: '/admin-panel',
        destination: '/admin',
        permanent: true,
      }
    ]
  },
  
  // Rewrites for API routes
  async rewrites() {
    return [
      // Health check endpoint
      {
        source: '/health',
        destination: '/api/health'
      },
      // API versioning
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  
  // Environment variables
  env: {
    BUILD_TIME: process.env.BUILD_TIME || new Date().toISOString(),
    GIT_SHA: process.env.GIT_SHA || 'unknown',
  },
  
  // Experimental features
  experimental: {
    // Optimized package imports
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      'lucide-react',
      'date-fns',
    ],
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom webpack configurations here
    
    // Bundle analyzer (development only)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html'
        })
      )
    }
    
    // Performance optimizations
    if (!dev) {
      // Tree shaking optimization
      config.optimization.usedExports = true
      
      // Module concatenation
      config.optimization.concatenateModules = true
      
      // Split chunks optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    // Handle node modules that don't support ES modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors (not recommended for production)
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors (not recommended for production)
    ignoreDuringBuilds: false,
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Production source maps (for debugging)
  productionBrowserSourceMaps: process.env.GENERATE_SOURCEMAP === 'true',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Trailing slash handling
  trailingSlash: false,
  
  // Custom server configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    rootDir: __dirname,
  },
  
  // Public runtime configuration
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
}

// Environment-specific configurations
if (process.env.NODE_ENV === 'development') {
  // Development-specific config
  nextConfig.reactStrictMode = true
  nextConfig.swcMinify = false
} else {
  // Production-specific config
  nextConfig.reactStrictMode = true
  nextConfig.swcMinify = true
}

module.exports = nextConfig