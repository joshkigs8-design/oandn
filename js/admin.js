// Admin panel functionality for O & N FITS
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const imagePreview = document.getElementById('imagePreview');
    const productImageInput = document.getElementById('productImage');
    const loginForm = document.getElementById('loginForm');
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    let selectedImageData = '';
    
// Check login status
     const adminSession = adminAPI.verifyAdminSession();
     if (adminSession) {
         showDashboard();
     }
     
     // Load products from backend
     loadProducts();
     
     // Load page views for stats
     loadPageViews();
     
     // Initialize stats
     updateStats(0);
     const totalOrdersEl = document.getElementById('totalOrders');
     if (totalOrdersEl) {
         totalOrdersEl.textContent = '0';
     }
     const conversionRateEl = document.getElementById('conversionRate');
     if (conversionRateEl) {
         conversionRateEl.textContent = '0%';
     }
    
    // Login functionality
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                await adminAPI.loginAdmin(username, password);
                showDashboard();
            } catch (error) {
                showMessage('Invalid credentials', 'error');
            }
        });
    }
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            adminAPI.logoutAdmin();
            location.reload();
        });
    }
    
    function showDashboard() {
        adminLogin.style.display = 'none';
        adminDashboard.style.display = 'block';
        const session = adminAPI.verifyAdminSession();
        document.getElementById('admin-username').textContent = session?.username || 'Admin';
    }
    
// Handle tab switching
     tabBtns.forEach(btn => {
         btn.addEventListener('click', () => {
             tabBtns.forEach(b => b.classList.remove('active'));
             btn.classList.add('active');
             
             document.querySelectorAll('.tab-content').forEach(content => {
                 content.classList.remove('active');
             });
             
             const tabId = btn.getAttribute('data-tab');
             document.getElementById(`${tabId}-tab`).classList.add('active');
             
             if (tabId === 'reviews') {
                 loadPendingReviews();
             } else if (tabId === 'analytics') {
                 loadPageViews();
} else if (tabId === 'lookbook') {
                  loadLookbook();
              } else if (tabId === 'newsletter') {
                  loadNewsletter();
              }
          });
     });
    
    // Load products from API
    async function loadProducts() {
        try {
            const products = await adminAPI.getProducts();
            renderProductList(products);
            updateStats(products.length);
        } catch (error) {
            console.error('Error loading products:', error);
            renderProductList([]);
            updateStats(0);
        }
    }
    
    // Handle image preview
    if (productImageInput) {
        productImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('Image must be 5MB or smaller.', 'error');
                    productImageInput.value = '';
                    imagePreview.innerHTML = '<p>No file chosen</p>';
                    selectedImageData = '';
                    return;
                }
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    showMessage('Unsupported file type. Use JPG, PNG, or WEBP.', 'error');
                    productImageInput.value = '';
                    imagePreview.innerHTML = '<p>No file chosen</p>';
                    selectedImageData = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    selectedImageData = event.target.result;
                    imagePreview.innerHTML = `<img src="${selectedImageData}" alt="Preview">`;
                }
                reader.readAsDataURL(file);
            } else {
                selectedImageData = '';
                imagePreview.innerHTML = '<p>No file chosen</p>';
            }
        });
    }
    
    // Handle form submission
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(productForm);
            const productData = {};
            formData.forEach((value, key) => {
                productData[key] = value;
            });
            
            const sizes = [];
            const sizeCheckboxes = productForm.querySelectorAll('input[name="sizes"]:checked');
            sizeCheckboxes.forEach(checkbox => {
                sizes.push(checkbox.value);
            });
            
            const productPayload = {
                product_name: productData.productName,
                product_price: parseInt(productData.productPrice),
                product_category: productData.productCategory,
                product_gender: productData.productGender,
                product_description: productData.productDescription,
                product_image: selectedImageData,
                sizes: sizes
            };
            
            try {
                showMessage('Adding product...', 'success');
                await adminAPI.createProduct(productPayload);
                productForm.reset();
                selectedImageData = '';
                imagePreview.innerHTML = '<p>No file chosen</p>';
                loadProducts();
                showMessage('Product added successfully!', 'success');
            } catch (error) {
                showMessage('Error adding product: ' + (error.message || JSON.stringify(error)), 'error');
            }
        });
    }
    
    // Render product list function
    function renderProductList(products) {
        if (!productList) return;
        
        if (products.length === 0) {
            productList.innerHTML = '<tr><td colspan="6" class="no-products">No products added yet. Add your first product above!</td></tr>';
            return;
        }
        
        productList.innerHTML = products.map(product => {
            const imageUrl = product.product_image || 'https://via.placeholder.com/150x200/4A0F1B/C9A86A?text=No+Image';
            
            return `
                <tr>
                    <td><img src="${imageUrl}" alt="${product.product_name}" class="product-image-small"></td>
                    <td>${product.product_name}</td>
                    <td>${product.product_category}</td>
                    <td>KSH ${parseInt(product.product_price).toLocaleString()}</td>
                    <td>${product.sizes ? product.sizes.join(', ') : 'N/A'}</td>
                    <td>
                        <button class="btn-delete" data-id="${product.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                deleteProduct(id);
            });
        });
    }
    
    // Delete product function
    async function deleteProduct(id) {
        try {
            await adminAPI.deleteProduct(id);
            loadProducts();
            showMessage('Product deleted successfully!', 'success');
        } catch (error) {
            showMessage('Error: ' + error.message, 'error');
        }
    }
    
    // Update stats
    function updateStats(count) {
        const totalProductsEl = document.getElementById('totalProducts');
        if (totalProductsEl) {
            totalProductsEl.textContent = count;
        }
    }

    // Load pending reviews for moderation
    async function loadPendingReviews() {
        const reviewList = document.getElementById('reviewList');
        if (!reviewList) return;
        
        try {
            const reviews = await adminAPI.getPendingReviews();
            
            if (reviews.length === 0) {
                reviewList.innerHTML = '<tr><td colspan="5" class="no-products">No pending reviews to moderate</td></tr>';
                return;
            }
            
            reviewList.innerHTML = reviews.map(review => {
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                const date = new Date(review.created_at).toLocaleDateString();
                
                return `
                    <tr>
                        <td>${review.customer_name}</td>
                        <td><span style="color: #C9A86A;">${stars}</span></td>
                        <td>${review.content}</td>
                        <td>${date}</td>
                        <td>
                            <button class="btn-secondary approve-btn" data-id="${review.id}" style="margin-right: 5px;">Approve</button>
                            <button class="btn-delete reject-btn" data-id="${review.id}">Reject</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            document.querySelectorAll('.approve-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    await updateReviewStatus(id, 'approved');
                });
            });
            
            document.querySelectorAll('.reject-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    await updateReviewStatus(id, 'rejected');
                });
            });
        } catch (error) {
            console.error('Error loading pending reviews:', error);
            reviewList.innerHTML = '<tr><td colspan="5" class="no-products">Error loading reviews</td></tr>';
        }
    }

    // Update review status
    async function updateReviewStatus(id, status) {
        try {
            await adminAPI.updateReviewStatus(id, status);
            showMessage(`Review ${status === 'approved' ? 'approved' : 'rejected'} successfully!`, 'success');
            loadPendingReviews();
        } catch (error) {
            showMessage('Error: ' + error.message, 'error');
        }
    }

async function loadPageViews() {
         try {
             const views = await adminAPI.getPageViews();
             const totalViewsEl = document.getElementById('totalViews');
             const totalViewsCountEl = document.getElementById('totalViewsCount');
             const count = views.length;
             if (totalViewsEl) {
                 totalViewsEl.textContent = count;
             }
             if (totalViewsCountEl) {
                 totalViewsCountEl.textContent = count;
             }
         } catch (error) {
             console.error('Error loading page views:', error);
         }
     }
     
     // Lookbook functionality
     let lookbookImageData = '';
     const lookbookImageInput = document.getElementById('lookbookImage');
     const lookbookImagePreview = document.getElementById('lookbookImagePreview');
     
     // Handle lookbook image preview
     if (lookbookImageInput) {
         lookbookImageInput.addEventListener('change', (e) => {
             const file = e.target.files[0];
             if (file) {
                 if (file.size > 5 * 1024 * 1024) {
                     showMessage('Image must be 5MB or smaller.', 'error');
                     lookbookImageInput.value = '';
                     lookbookImagePreview.innerHTML = '<p>No file chosen</p>';
                     lookbookImageData = '';
                     return;
                 }
                 const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
                 if (!allowedTypes.includes(file.type)) {
                     showMessage('Unsupported file type. Use JPG, PNG, or WEBP.', 'error');
                     lookbookImageInput.value = '';
                     lookbookImagePreview.innerHTML = '<p>No file chosen</p>';
                     lookbookImageData = '';
                     return;
                 }
                 const reader = new FileReader();
                 reader.onload = function(event) {
                     lookbookImageData = event.target.result;
                     lookbookImagePreview.innerHTML = `<img src="${lookbookImageData}" alt="Preview">`;
                 }
                 reader.readAsDataURL(file);
             } else {
                 lookbookImageData = '';
                 lookbookImagePreview.innerHTML = '<p>No file chosen</p>';
             }
         });
     }
     
     // Load lookbook images
     async function loadLookbook() {
         try {
             const lookbook = await adminAPI.getLookbook();
             renderLookbookList(lookbook);
         } catch (error) {
             console.error('Error loading lookbook:', error);
             renderLookbookList([]);
         }
     }
     
     // Render lookbook list
     function renderLookbookList(lookbook) {
         const lookbookList = document.getElementById('lookbookList');
         if (!lookbookList) return;
         
         if (lookbook.length === 0) {
             lookbookList.innerHTML = '<tr><td colspan="4" class="no-products">No lookbook images yet. Add your first image above!</td></tr>';
             return;
         }
         
         lookbookList.innerHTML = lookbook.map(item => {
             const date = new Date(item.created_at).toLocaleDateString();
             return `
                 <tr>
                     <td><img src="${item.imageUrl}" alt="${item.alt}" class="product-image-small"></td>
                     <td>${item.alt || '-'}</td>
                     <td>${date}</td>
                     <td>
                         <button class="btn-delete lookbook-delete-btn" data-id="${item.id}">Delete</button>
                     </td>
                 </tr>
             `;
         }).join('');
         
         document.querySelectorAll('.lookbook-delete-btn').forEach(button => {
             button.addEventListener('click', async (e) => {
                 const id = e.target.getAttribute('data-id');
                 deleteLookbookItem(id);
             });
         });
     }
     
     // Delete lookbook item
     async function deleteLookbookItem(id) {
         try {
             await adminAPI.deleteLookbookItem(id);
             loadLookbook();
             showMessage('Lookbook image deleted successfully!', 'success');
         } catch (error) {
             showMessage('Error: ' + error.message, 'error');
         }
     }
     
     // Handle lookbook form submission
     const lookbookForm = document.getElementById('lookbookForm');
     if (lookbookForm) {
         lookbookForm.addEventListener('submit', async (e) => {
             e.preventDefault();
             
             const alt = document.getElementById('lookbookAlt').value;
             
             try {
                 showMessage('Adding lookbook image...', 'success');
                 await adminAPI.createLookbookItem(lookbookImageData, alt);
                 lookbookForm.reset();
                 lookbookImageData = '';
                 lookbookImagePreview.innerHTML = '<p>No file chosen</p>';
                 loadLookbook();
                 showMessage('Lookbook image added successfully!', 'success');
             } catch (error) {
                 showMessage('Error adding lookbook image: ' + (error.message || JSON.stringify(error)), 'error');
             }
         });
}
     
    // Newsletter functionality
    async function loadNewsletter() {
        try {
            const subscribers = await adminAPI.getNewsletterSubscribers();
            renderNewsletterList(subscribers);
        } catch (error) {
            console.error('Error loading newsletter subscribers:', error);
            const newsletterList = document.getElementById('newsletterList');
            if (newsletterList) {
                newsletterList.innerHTML = '<tr><td colspan="3" class="no-products">Error loading subscribers</td></tr>';
            }
        }
    }
    
    function renderNewsletterList(subscribers) {
        const newsletterList = document.getElementById('newsletterList');
        if (!newsletterList) return;
        
        if (subscribers.length === 0) {
            newsletterList.innerHTML = '<tr><td colspan="3" class="no-products">No newsletter subscribers yet</td></tr>';
            return;
        }
        
        newsletterList.innerHTML = subscribers.map(sub => {
            const date = new Date(sub.created_at).toLocaleDateString();
            return `
                <tr>
                    <td>${sub.email}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn-delete newsletter-delete-btn" data-id="${sub.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        document.querySelectorAll('.newsletter-delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                deleteNewsletterSubscriber(id);
            });
        });
    }
    
    async function deleteNewsletterSubscriber(id) {
        try {
            await adminAPI.deleteNewsletterSubscriber(id);
            loadNewsletter();
            showMessage('Subscriber deleted successfully!', 'success');
        } catch (error) {
            showMessage('Error: ' + error.message, 'error');
        }
    }
     
    // Show message function
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.admin-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `admin-message ${type}`;
        messageDiv.textContent = message;
        
        const adminPanel = document.querySelector('.admin-login-section') || document.querySelector('.admin-panel');
        if (adminPanel) {
            adminPanel.insertBefore(messageDiv, adminPanel.firstChild);
        }
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
});