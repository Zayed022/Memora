import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/api/', '/auth/'] },
    sitemap: 'https://memora.app/sitemap.xml',
    host: 'https://memora.app',
  }
}
