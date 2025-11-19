document.addEventListener('DOMContentLoaded', function() {
    const socket = io({ withCredentials: true });
    const postForm = document.getElementById('postForm');
    
    if (postForm) {
        // Handle form submission
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Posting...';
            submitBtn.disabled = true;
            
            // Get form data
            const title = document.getElementById('title').value.trim();
            const content = document.getElementById('content').value.trim();
            
            // Validate form data
            if (!title && !content) {
                showError('Post must contain title or content');
                resetButton();
                return;
            }
            
            // Prepare post data
            const postData = {
                title,
                content
            };
            
            // Handle media file if present
            const fileInput = document.getElementById('file');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                // For files, we need to use the traditional form submission
                // as Socket.io doesn't handle file uploads well
                postForm.submit();
                return;
            }
            
            // Send post data via WebSocket
            socket.emit('newPost', postData);
            
            // Handle success response
            socket.once('postSuccess', function(data) {
                showSuccess('Post created successfully!');
                setTimeout(() => {
                    window.location.href = '/feed';
                }, 1000);
            });
            
            // Handle error response
            socket.once('errorMessage', function(data) {
                showError(data.message);
                resetButton();
            });
            
            // Reset button function
            function resetButton() {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Show error message
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            const div = document.createElement('div');
            div.id = 'error-message';
            div.className = 'error-message';
            div.style.color = '#f44336';
            div.style.padding = '10px';
            div.style.marginBottom = '15px';
            div.style.backgroundColor = '#ffebee';
            div.style.borderRadius = '4px';
            div.textContent = message;
            
            postForm.prepend(div);
            
            setTimeout(() => {
                div.remove();
            }, 5000);
        } else {
            errorDiv.textContent = message;
        }
    }
    
    // Show success message
    function showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        if (!successDiv) {
            const div = document.createElement('div');
            div.id = 'success-message';
            div.className = 'success-message';
            div.style.color = '#4caf50';
            div.style.padding = '10px';
            div.style.marginBottom = '15px';
            div.style.backgroundColor = '#e8f5e9';
            div.style.borderRadius = '4px';
            div.textContent = message;
            
            postForm.prepend(div);
        } else {
            successDiv.textContent = message;
        }
    }
});
