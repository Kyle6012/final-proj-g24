document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    function toggleMenu() {
        const sideMenu = document.querySelector(".side-menu");
        if (sideMenu) {
            sideMenu.classList.toggle('active');
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    }

    const modal = document.getElementById("messageModal");
    const modalMessage = document.getElementById("modalMessage");
    const closeModal = document.querySelector(".close");

    function showModal(message, isSuccess) {
        if (modalMessage) {
            modalMessage.textContent = message;
            modalMessage.className = isSuccess ? 'success' : 'error';
        }
        if (modal) {
            modal.style.display = "block";
        }
    }

    if (closeModal) {
        closeModal.onclick = function () {
            if (modal) {
                modal.style.display = "none";
            }
        };
    }

    window.onclick = function (event) {
        if (modal && event.target == modal) {
            modal.style.display = "none";
        }

        document.querySelectorAll("form").forEach((form) => {
            if (form.id !== 'searchForm' && form.id !== 'modalCommentForm') {
                form.addEventListener("submit", async function (event) {
                    event.preventDefault();
                    const formData = new FormData(this);

                    const method = this.method;
                    const url = this.action;

                    try {
                        const response = await fetch(url, {
                            method: "POST",
                            body: formData,
                        });

                        const result = await response.json();

                        if (response.ok) {
                            showModal(result.message || "Successfully loaded feed!", true);
                        } else {
                            showModal(result.message || "Failed to load feed", false);
                        }
                    } catch (error) {
                        console.error("Error during submission:", error);
                        showModal(error.message, false);
                    } finally {
                        this.reset();
                    }
                });
            }
        });
        // Initialize Pusher (assuming PUSHER_KEY and CLUSTER are available globally or injected)
        // Since this is a static JS file, we might need to fetch config or assume it's set in the layout
        // For now, we'll check if Pusher is defined (it should be added to the layout or page)
        if (typeof Pusher !== 'undefined') {
            // We need the key here. Ideally, it should be passed from the server.
            // I'll assume a global variable `PUSHER_KEY` and `PUSHER_CLUSTER` are set in the HTML.
            if (window.PUSHER_KEY) {
                const pusher = new Pusher(window.PUSHER_KEY, {
                    cluster: window.PUSHER_CLUSTER
                });

                const channel = pusher.subscribe('feed');

                channel.bind('new-post', function (data) {
                    // Logic to add new post to the feed
                    // This requires creating the post HTML structure dynamically
                    // For simplicity, we can just show a notification or reload, 
                    // but ideally we prepend the new post.
                    console.log('New post received:', data);

                    // Example: Reload feed or append
                    // location.reload(); // Simple but effective for now

                    // Or show a toast
                    const toast = document.createElement('div');
                    toast.className = 'response-message success';
                    toast.style.position = 'fixed';
                    toast.style.top = '20px';
                    toast.style.right = '20px';
                    toast.style.zIndex = '1000';
                    toast.textContent = 'New post available! Refresh to see.';
                    document.body.appendChild(toast);

                    setTimeout(() => toast.remove(), 5000);
                });

                channel.bind('post-deleted', function (postId) {
                    const postElement = document.getElementById(`post-${postId}`);
                    if (postElement) {
                        postElement.remove();
                    }
                });
            }
        }
    });
