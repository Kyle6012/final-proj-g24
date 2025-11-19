document.addEventListener('DOMContentLoaded', function() {
    const socket = io({ withCredentials: true });
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.search-tab');
    const resultsContainers = {
        'users': document.getElementById('users-results'),
        'posts': document.getElementById('posts-results')
    };
    
    let currentTab = 'users';
    let searchQuery = document.querySelector('.search-input').value;
    let postsLoaded = false;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
            
            // Load posts data if switching to posts tab and not loaded yet
            if (tabName === 'posts' && !postsLoaded && searchQuery) {
                loadPostResults(searchQuery);
            }
        });
    });
    
    function switchTab(tabName) {
        // Update current tab
        currentTab = tabName;
        
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        document.querySelector(`.search-tab[data-tab="${tabName}"]`).classList.add('active');
        
        // Hide all result containers
        Object.values(resultsContainers).forEach(container => {
            container.style.display = 'none';
        });
        
        // Show the selected container
        resultsContainers[tabName].style.display = 'block';
    }
    
    // Follow/Unfollow functionality
    const followButtons = document.querySelectorAll('.follow-btn');
    
    followButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const userId = this.getAttribute('data-user-id');
            const isFollowing = this.classList.contains('following-btn');
            
            // Toggle button appearance immediately for better UX
            if (isFollowing) {
                this.classList.remove('following-btn');
                this.textContent = 'Follow';
            } else {
                this.classList.add('following-btn');
                this.textContent = 'Following';
            }
            
            // Emit follow/unfollow event to socket
            socket.emit('followUpdate', {
                targetUserId: userId,
                action: isFollowing ? 'unfollow' : 'follow'
            });
            
            // Handle success response
            socket.once('followUpdateSuccess', function(data) {
                console.log('Follow update successful:', data.message);
                // Could show a toast notification here if desired
            });
            
            // Handle error response
            socket.once('errorMessage', function(data) {
                console.error('Error during submission:', data);
                // Revert the button state if there was an error
                if (isFollowing) {
                    button.classList.add('following-btn');
                    button.textContent = 'Following';
                } else {
                    button.classList.remove('following-btn');
                    button.textContent = 'Follow';
                }
                
                // Show error message
                alert(data.message || 'Failed to update follow status');
            });
        });
    });
    
    // Function to load post results via AJAX
    function loadPostResults(query) {
        const postsContainer = document.getElementById('posts-results');
        const loadingHtml = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading posts...</p>
            </div>
        `;
        
        // Show loading indicator
        postsContainer.innerHTML = loadingHtml;
        
        // Make AJAX request to get posts
        fetch(`/search/posts?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                postsLoaded = true;
                
                if (data.posts && data.posts.length > 0) {
                    // Render posts
                    let postsHtml = `
                        <div class="search-category-title">Posts matching "${query}"</div>
                        <div class="posts-list">
                    `;
                    
                    data.posts.forEach(post => {
                        postsHtml += `
                            <div class="post-item">
                                <a href="/feed#post-${post.id}" class="post-link">
                                    <div class="post-header">
                                        <img src="${post.User.profilePic || '/images/default.png'}" alt="${post.User.username}'s profile picture" class="profile-pic-small">
                                        <span class="post-username">@${post.User.username}</span>
                                    </div>
                                    <div class="post-content">
                                        ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ''}
                                        <p class="post-text">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                                    </div>
                                    <div class="post-footer">
                                        <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </a>
                            </div>
                        `;
                    });
                    
                    postsHtml += '</div>';
                    postsContainer.innerHTML = postsHtml;
                } else {
                    // No posts found
                    postsContainer.innerHTML = `
                        <div class="search-category-title">Posts matching "${query}"</div>
                        <div class="no-results">
                            <i class="fas fa-file-alt"></i>
                            <p>No posts found matching "${query}"</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                postsContainer.innerHTML = `
                    <div class="search-category-title">Posts matching "${query}"</div>
                    <div class="no-results">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading posts. Please try again.</p>
                    </div>
                `;
            });
    }
    
    // Initialize search form submission
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', function(e) {
        const query = document.querySelector('.search-input').value.trim();
        if (!query) {
            e.preventDefault();
        }
    });
});
