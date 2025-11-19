document.addEventListener('DOMContentLoaded', function() {
    const socket = io({ withCredentials: true });
    const profileForm = document.getElementById('profileUpdateForm');
    
    if (profileForm) {
        // Handle form submission
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Updating...';
            submitBtn.disabled = true;
            
            // Get form data
            const fullname = document.getElementById('fullname').value.trim();
            const bio = document.getElementById('bio')?.value.trim();
            const location = document.getElementById('location')?.value.trim();
            const website = document.getElementById('website')?.value.trim();
            
            // Validate form data
            if (!fullname) {
                showError('Name is required');
                resetButton();
                return;
            }
            
            // Prepare profile data
            const profileData = {
                fullname,
                bio,
                location,
                website
            };
            
            // Handle profile picture if present
            const fileInput = document.getElementById('profilePic');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                // For files, we need to use the traditional form submission
                // as Socket.io doesn't handle file uploads well
                profileForm.submit();
                return;
            }
            
            // Send profile data via WebSocket
            socket.emit('updateProfile', profileData);
            
            // Handle success response
            socket.once('profileUpdateSuccess', function(data) {
                showSuccess('Profile updated successfully!');
                // Reset the form button
                resetButton();
                
                // Close the modal after a short delay
                setTimeout(() => {
                    const modal = document.getElementById('editProfileModal');
                    if (modal) {
                        const modalContent = modal.querySelector('.modal-content');
                        if (modalContent) {
                            modalContent.style.opacity = "0";
                            modalContent.style.transform = "translateY(-20px)";
                        }
                        setTimeout(() => {
                            modal.style.display = "none";
                            if (modal.classList) modal.classList.remove('show');
                        }, 300);
                    }
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
            
            profileForm.prepend(div);
            
            setTimeout(() => {
                div.remove();
            }, 5000);
        } else {
            errorDiv.textContent = message;
        }
    }
    
    // Show success message as toast
    function showSuccess(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after animation completes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
});
