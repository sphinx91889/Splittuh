import { generateSitemap } from '../lib/seo';

export async function GET() {
  try {
    const sitemap = await generateSitemap();
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return new Response('Error generating sitemap', { status: 500 });
  }
}