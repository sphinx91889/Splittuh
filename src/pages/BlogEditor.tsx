import React, { useState, useEffect } from 'react';
import { NavBar } from '../components/NavBar';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  published: boolean;
  published_at: string | null;
}

export function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    published: false,
    published_at: null
  });

  useEffect(() => {
    loadAuthorId();
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadAuthorId = async () => {
    try {
      const { data: author, error } = await supabase
        .from('blog_authors')
        .select('id')
        .single();

      if (error) throw error;
      setAuthorId(author.id);
    } catch (err: any) {
      setError('You do not have permission to create or edit posts');
    }
  };

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorId) {
      setError('Author ID not found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate slug from title if not set
      const slug = post.slug || generateSlug(post.title);

      // Check if slug is unique
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id || '')
        .single();

      if (existingPost) {
        throw new Error('A post with this slug already exists');
      }

      // Set published_at based on published status
      const published_at = post.published ? new Date().toISOString() : null;

      if (id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...post,
            slug,
            published_at,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([{
            ...post,
            author_id: authorId,
            slug,
            published_at
          }]);

        if (error) throw error;
      }

      navigate('/blog/manage');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPost(prev => {
      const updates = { [name]: value };
      
      // Auto-generate slug when title changes
      if (name === 'title' && !prev.slug) {
        updates.slug = generateSlug(value);
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = generateSlug(e.target.value);
    setPost(prev => ({ ...prev, slug: value }));
  };

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isPublished = e.target.checked;
    setPost(prev => ({ 
      ...prev, 
      published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={() => navigate('/blog/manage')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog Management
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {id ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={post.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label 
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={post.slug}
                onChange={handleSlugChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This will be used in the URL: /blog/{post.slug || 'example-post'}
              </p>
            </div>

            <div>
              <label 
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Excerpt
              </label>
              <input
                type="text"
                id="excerpt"
                name="excerpt"
                value={post.excerpt}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label 
                htmlFor="featured_image"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Featured Image URL
              </label>
              <input
                type="url"
                id="featured_image"
                name="featured_image"
                value={post.featured_image}
                onChange={handleChange}
                required
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label 
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={post.content}
                onChange={handleChange}
                required
                rows={15}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={post.published}
                  onChange={handlePublishedChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="published"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  Publish immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}