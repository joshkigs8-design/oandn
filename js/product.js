// Product detail page functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }
    
    if (window.adminAPI && window.adminAPI.trackPageView) {
        adminAPI.trackPageView('product');
    }
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('Product not found.');
        return;
    }
    
    try {
        const products = await adminAPI.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showError('Product not found.');
            return;
        }
        
        updateProductDisplay(product);
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Error loading product. Please try again.');
    }
});

function updateProductDisplay(product) {
    document.querySelector('.product-name').textContent = product.product_name;
    document.querySelector('.product-price').textContent = `KSH ${product.product_price}`;
    
    // Set product image
    const imgElement = document.getElementById('productImg');
    if (imgElement) {
        if (product.product_image) {
            imgElement.src = product.product_image;
            imgElement.alt = product.product_name;
        } else {
            imgElement.src = `https://via.placeholder.com/600x600/4A0F1B/C9A86A?text=${encodeURIComponent(product.product_name)}`;
            imgElement.alt = product.product_name;
        }
    }
    
    // Format collection name
    const collections = {
        'loungewear': 'Loungewear',
        'official': 'Official Wear',
        'casual': 'Casual Wear'
    };
    document.querySelector('.product-collection').textContent = `${collections[product.product_category] || product.product_category} • Custom Made`;
    
    // Update product description
    const descElement = document.querySelector('.product-description p');
    if (descElement && product.product_description) {
        descElement.textContent = product.product_description;
    }
    
    const sizesContainer = document.querySelector('.sizes');
    const sizes = product.sizes || [];
    sizesContainer.innerHTML = sizes.map(size => 
        `<button class="size-btn" data-size="${size}">${size}</button>`
    ).join('');
    
    // Size button interactions
    const sizeButtons = document.querySelectorAll('.size-btn');
    const selectedDisplay = document.getElementById('selectedSizeDisplay');
    const selectedText = document.getElementById('selectedSizeText');
    
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update selected size display
            if (selectedDisplay && selectedText) {
                selectedText.textContent = btn.dataset.size;
                selectedDisplay.classList.add('visible');
            }
        });
    });
    
    // WhatsApp link
    const whatsappBtn = document.querySelector('.btn-whatsapp');
    const whatsAppLink = generateWhatsAppLink(product.product_name, product.product_price);
    whatsappBtn.href = whatsAppLink;
}

function showError(message) {
    document.querySelector('.product-name').textContent = message;
    document.querySelector('.product-price').textContent = '';
}

function generateWhatsAppLink(productName, price) {
    const phoneNumber = '254112854091';
    const message = `Hello I want to order ${productName} - KSH ${price}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}