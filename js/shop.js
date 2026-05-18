// Shop page functionality - Supabase version
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    if (window.adminAPI && window.adminAPI.trackPageView) {
        adminAPI.trackPageView('shop');
    }
    loadProducts();
    setupFilters();
    initHamburger();
    setupRealtimeSync();
});

// Load products from Supabase
async function loadProducts() {
    try {
        const products = await adminAPI.getProducts();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        renderProducts([]);
    }
}

// Setup real-time synchronization
function setupRealtimeSync() {
    const client = window.supabase 
        ? window.supabase.createClient(
            'https://mmxosaqhcuikgbzqlpgk.supabase.co',
            'sb_publishable_AH27_5iybTl_L7ixQuVWsg_f-KyshKa'
          )
        : null;
    
    if (!client) return;
    
    client
        .channel('products-channel')
        .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'products' 
        }, payload => {
            // Remove deleted product from DOM
            const productCard = document.querySelector(`[data-product-id="${payload.old.id}"]`);
            if (productCard) productCard.remove();
        })
        .subscribe();
}

// Render products to grid
function renderProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--color-text-light); padding: 40px;">No products available yet. Check back soon!</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        card.style.cursor = 'pointer';
        const imageUrl = product.product_image || 'https://via.placeholder.com/600x800/4A0F1B/C9A86A?text=No+Image';
        
        // Format collection name
        const collectionName = formatCollectionName(product.product_category);
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.product_name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.product_name}</h3>
                <p class="product-collection">${collectionName} • Custom Made</p>
                <p class="product-price">KSH ${Number(product.product_price).toLocaleString()}</p>
                <a href="product.html?id=${product.id}" class="btn-view">View Details</a>
            </div>
        `;
        
        // Hover glow effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        grid.appendChild(card);
    });
}

function formatCollectionName(category) {
    const collections = {
        'loungewear': 'Loungewear',
        'official': 'Official Wear',
        'casual': 'Casual Wear'
    };
    return collections[category] || category;
}

// Setup filter functionality
function setupFilters() {
    const categoryFilter = document.getElementById('category');
    const genderFilter = document.getElementById('gender');
    const sortFilter = document.getElementById('sort');
    
    [categoryFilter, genderFilter, sortFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

async function applyFilters() {
    const category = document.getElementById('category')?.value || 'all';
    const gender = document.getElementById('gender')?.value || 'all';
    const sortBy = document.getElementById('sort')?.value || 'featured';
    
    try {
        const products = await adminAPI.getProducts();
        let filteredProducts = [...products];
        
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.product_category === category);
        }
        if (gender !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.product_gender === gender);
        }
        
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.product_price - b.product_price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.product_price - a.product_price);
                break;
            case 'new':
                filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        
        renderProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger && navList) {
        // Ensure hamburger is visible on mobile
        if (window.innerWidth <= 768) {
            hamburger.style.display = 'flex';
        }
        
        // Close menu when clicking a link
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}