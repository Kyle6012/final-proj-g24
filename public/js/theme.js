document.addEventListener("DOMContentLoaded", function () {
      // Get theme from localStorage (default to light-mode)
      const theme = localStorage.getItem('theme') || 'light-mode';
      document.body.className = theme;
});
