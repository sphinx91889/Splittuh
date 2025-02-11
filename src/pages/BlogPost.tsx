import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { updateMetaTags, generateStructuredData } from '../lib/seo';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  author: {
    email: string;
  };
}

export function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          slug,
          featured_image,
          published_at,
          updated_at,
          author:blog_authors(email)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setPost(data);

      // Update meta tags and structured data
      if (data) {
        updateMetaTags({
          title: data.title,
          description: data.excerpt || data.content.substring(0, 160) + '...',
          url: `https://splittuh.com/blog/${data.slug}`,
          image: data.featured_image,
          type: 'article'
        });

        // Add structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = generateStructuredData('BlogPosting', data);
        document.head.appendChild(script);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {error || 'The requested blog post could not be found.'}
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/blog')}
          className="mb-8 inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Blog
        </button>

        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {post.title}
            </h1>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
              <User className="w-4 h-4 mr-2" />
              <span>{post.author.email.split('@')[0]}</span>
              <span className="mx-2">•</span>
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(post.published_at)}</span>
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4 mr-2" />
              <span>{calculateReadTime(post.content)}</span>
            </div>

            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}