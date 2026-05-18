-- Supabase RLS Policies for O & N FITS
-- Run these in Supabase SQL Editor after enabling RLS

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Products: Public read, no public write (admin only via service key)
CREATE POLICY "Allow public read access on products" 
ON products FOR SELECT USING (true);

-- Reviews: Anyone can read approved reviews, anyone can submit a review
CREATE POLICY "Allow public read access on approved reviews" 
ON reviews FOR SELECT USING (status = 'approved');

CREATE POLICY "Allow public insert on reviews" 
ON reviews FOR INSERT WITH CHECK (true);

-- Page views: Public insert for tracking, public read for analytics
CREATE POLICY "Allow public insert on page_views" 
ON page_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on page_views" 
ON page_views FOR SELECT USING (true);

-- Lookbook: Public read access
CREATE POLICY "Allow public read access on lookbook" 
ON lookbook FOR SELECT USING (true);

-- Newsletter subscribers: Public insert, public read
CREATE POLICY "Allow public insert on newsletter_subscribers" 
ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on newsletter_subscribers" 
ON newsletter_subscribers FOR SELECT USING (true);

-- Admins table: No public access (keep restricted)
CREATE POLICY "Deny all public access to admins" 
ON admins FOR ALL USING (false);