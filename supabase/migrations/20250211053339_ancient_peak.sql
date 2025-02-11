-- Create blog_authors table to manage authorized blog authors
CREATE TABLE blog_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES blog_authors(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  published boolean DEFAULT false,
  featured_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Enable RLS
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published) WHERE published = true;
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_authors_email ON blog_authors(email);

-- Create policies for blog_authors
CREATE POLICY "Public can view blog authors"
  ON blog_authors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only superadmins can manage blog authors"
  ON blog_authors FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'mev.traks5th@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'mev.traks5th@gmail.com');

-- Create policies for blog_posts
CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Authors can view all their posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM blog_authors 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Authors can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id IN (
      SELECT id FROM blog_authors 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Authors can update their own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM blog_authors 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    author_id IN (
      SELECT id FROM blog_authors 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Add the specified email as a blog author
INSERT INTO blog_authors (email, user_id)
SELECT 
  'mev.traks5th@gmail.com',
  id
FROM 
  auth.users
WHERE 
  email = 'mev.traks5th@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Add comments
COMMENT ON TABLE blog_authors IS 'Authorized blog post authors';
COMMENT ON TABLE blog_posts IS 'Blog posts content and metadata';