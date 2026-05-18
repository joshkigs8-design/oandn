// Supabase API service for O & N FITS
const SUPABASE_URL = 'https://mmxosaqhcuikgbzqlpgk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AH27_5iybTl_L7ixQuVWsg_f-KyshKa';

let supabaseClient = null;

function getSupabaseClient() {
    if (!window.supabase) {
        console.error('Supabase JS library not loaded. Check CDN.');
        throw new Error('Supabase JS library not loaded');
    }
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

// Get all products
async function getProducts() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
    }
    return data || [];
}

// Create product
async function createProduct(productData) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('products')
        .insert([{
            product_name: productData.product_name,
            product_price: productData.product_price,
            product_category: productData.product_category,
            product_gender: productData.product_gender,
            product_description: productData.product_description,
            product_image: productData.product_image,
            sizes: productData.sizes
        }])
        .select();
    
    if (error) {
        console.error('Supabase insert error:', error);
        throw error;
    }
    console.log('Product created:', data);
    return data[0];
}

// Update product
async function updateProduct(id, productData) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('products')
        .update(productData)
        .eq('id', id)
        .select();
    
    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }
    return data[0];
}

// Delete product
async function deleteProduct(id) {
    const client = getSupabaseClient();
    const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
    return { message: 'Product deleted successfully' };
}

// Reviews API
async function getReviews(productId) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
    return data || [];
}

async function createReview(reviewData) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('reviews')
        .insert([reviewData])
        .select();
    
    if (error) {
        console.error('Error creating review:', error);
        throw error;
    }
    return data[0];
}

// Get all approved testimonials
async function getTestimonials() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('reviews')
        .select('*, products:product_id(product_name)')
        .eq('status', 'approved')
        .not('product_id', 'is', null)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
    }
    return data || [];
}

// Get site testimonials (non-product specific)
async function getSiteTestimonials() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .is('product_id', null)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching site testimonials:', error);
        throw error;
    }
    return data || [];
}

// Get all pending reviews for moderation
async function getPendingReviews() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('reviews')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching pending reviews:', error);
        throw error;
    }
    return data || [];
}

// Update review status (approve/reject)
async function updateReviewStatus(id, status) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('reviews')
        .update({ status })
        .eq('id', id)
        .select();
    
    if (error) {
        console.error('Error updating review status:', error);
        throw error;
    }
    return data[0];
}

// Admin authentication
async function loginAdmin(username, password) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();
    
    if (error || !data) {
        throw new Error('Invalid credentials');
    }
    
    if (data.password === password) {
        const token = btoa(JSON.stringify({ id: data.id, username: data.username }));
        localStorage.setItem('adminToken', token);
        return { success: true };
    }
    throw new Error('Invalid credentials');
}

// Verify admin session
function verifyAdminSession() {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    try {
        return JSON.parse(atob(token));
    } catch {
        return null;
    }
}

// Admin logout
function logoutAdmin() {
    localStorage.removeItem('adminToken');
}

// Track page view
async function trackPageView(page) {
    try {
        const client = getSupabaseClient();
        await client
            .from('page_views')
            .insert([{ page, created_at: new Date().toISOString() }]);
    } catch (error) {
        console.error('Page view tracking failed:', error);
    }
}

// Get page view stats
async function getPageViews() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('page_views')
        .select('page, created_at');
    
    if (error) throw error;
    return data || [];
}

// Get lookbook
async function getLookbook() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('lookbook')
        .select('id, image_url, alt, created_at')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(item => ({
        id: item.id,
        imageUrl: item.image_url,
        alt: item.alt,
        created_at: item.created_at
    }));
}

// Create lookbook item
async function createLookbookItem(imageUrl, alt = '') {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('lookbook')
        .insert([{ image_url: imageUrl, alt }])
        .select();
    
    if (error) throw error;
    return data[0];
}

async function deleteLookbookItem(id) {
    const client = getSupabaseClient();
    const { error } = await client
        .from('lookbook')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return { message: 'Lookbook item deleted' };
}

// Subscribe to newsletter
async function subscribeNewsletter(email) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('newsletter_subscribers')
        .insert([{ email, created_at: new Date().toISOString() }])
        .select();
    
    if (error) {
        if (error.code === '23505') {
            throw new Error('Email already subscribed');
        }
        throw error;
    }
    return data[0];
}

// Get newsletter subscribers
async function getNewsletterSubscribers() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('newsletter_subscribers')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

// Delete newsletter subscriber
async function deleteNewsletterSubscriber(id) {
    const client = getSupabaseClient();
    const { error } = await client
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return { message: 'Subscriber deleted' };
}

window.adminAPI = {
     getProducts,
     createProduct,
     updateProduct,
     deleteProduct,
     getReviews,
     createReview,
     getTestimonials,
     getSiteTestimonials,
     getPendingReviews,
     updateReviewStatus,
     loginAdmin,
     verifyAdminSession,
     logoutAdmin,
     trackPageView,
     getPageViews,
     getLookbook,
     createLookbookItem,
     deleteLookbookItem,
     subscribeNewsletter,
     getNewsletterSubscribers,
     deleteNewsletterSubscriber
    };