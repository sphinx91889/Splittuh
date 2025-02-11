import { supabase } from './supabase';

export interface MetaTags {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
}

export function updateMetaTags(tags: MetaTags) {
  // Update title
  document.title = `${tags.title} | Splittuh`;

  // Update meta tags
  const metaTags = {
    description: tags.description,
    'og:title': tags.title,
    'og:description': tags.description,
    'og:url': tags.url,
    'og:type': tags.type || 'website',
    'og:image': tags.image || 'https://splittuh.com/og-image.jpg',
    'twitter:card': 'summary_large_image',
    'twitter:title': tags.title,
    'twitter:description': tags.description,
    'twitter:image': tags.image || 'https://splittuh.com/og-image.jpg'
  };

  Object.entries(metaTags).forEach(([name, content]) => {
    // Update existing tags or create new ones
    let tag = document.querySelector(`meta[name="${name}"]`) ||
              document.querySelector(`meta[property="${name}"]`);
    
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
      document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
  });

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', tags.url);
}

export async function generateSitemap() {
  try {
    // Get all published blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    if (postsError) throw postsError;

    // Generate sitemap XML
    const baseUrl = 'https://splittuh.com';
    const urls = [
      { url: baseUrl, priority: '1.0' },
      { url: `${baseUrl}/blog`, priority: '0.9' },
      ...(posts || []).map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updated_at,
        priority: '0.8'
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(({ url, lastmod, priority }) => `
  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <priority>${priority}</priority>
  </url>`).join('')}
</urlset>`;

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

export function generateStructuredData(type: 'BlogPosting' | 'WebSite', data: any) {
  let structuredData;

  switch (type) {
    case 'BlogPosting':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: data.excerpt,
        image: data.featured_image,
        datePublished: data.published_at,
        dateModified: data.updated_at,
        author: {
          '@type': 'Person',
          name: data.author.email.split('@')[0]
        },
        publisher: {
          '@type': 'Organization',
          name: 'Splittuh',
          logo: {
            '@type': 'ImageObject',
            url: 'https://splittuh.com/logo.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://splittuh.com/blog/${data.slug}`
        }
      };
      break;

    case 'WebSite':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Splittuh',
        description: 'Professional split sheet management for music creators',
        url: 'https://splittuh.com'
      };
      break;
  }

  return JSON.stringify(structuredData);
}