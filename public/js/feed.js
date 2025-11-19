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
}});
