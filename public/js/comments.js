
    let currentPostId = null;
    function openCommentsModal(postId) {
      console.log("Opening comments modal for post:", postId);  // Debug log
      currentPostId = postId;
      const postElem = document.getElementById('post-' + postId);
      if (!postElem) {
        console.error("Post element not found for post id:", postId);
        return;
      }
      // Get the hidden comments container (always present)
      const commentsContainer = postElem.querySelector('.post-comments');
      const commentsContent = commentsContainer ? commentsContainer.innerHTML : "<h4>Comments</h4><p class='no-comments'>No comments yet.</p>";
      document.getElementById('commentsContent').innerHTML = commentsContent;
      document.getElementById('commentsModal').style.display = "block";
    }
    function closeCommentsModal() {
      document.getElementById('commentsModal').style.display = "none";
    }
    // Close modals when clicking outside of them
    window.onclick = function(event) {
      const commentsModal = document.getElementById('commentsModal');
      if (event.target === commentsModal) {
        closeCommentsModal();
      }
      const messageModal = document.getElementById('messageModal');
      if (event.target === messageModal) {
        closeMessageModal();
      }
    }
    function closeMessageModal() {
      document.getElementById('messageModal').style.display = "none";
    }
