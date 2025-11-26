
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

  // Subscribe to Pusher channel for this post
  if (typeof Pusher !== 'undefined' && window.PUSHER_KEY) {
    const pusher = new Pusher(window.PUSHER_KEY, {
      cluster: window.PUSHER_CLUSTER
    });

    const channel = pusher.subscribe(`post-${postId}`);

    // Unbind previous events to avoid duplicates if re-opening
    channel.unbind('new-comment');
    channel.unbind('comment-deleted');

    channel.bind('new-comment', (data) => {
      // Append new comment to the list
      const commentsList = document.querySelector('.post-comments-list') || document.getElementById('commentsContent');

      // Remove "No comments yet" if it exists
      const noComments = commentsList.querySelector('.no-comments');
      if (noComments) noComments.remove();

      const commentHtml = `
                  <div class="comment" id="comment-${data.id}">
                      <img src="${data.User.profilePic || '/images/default.png'}" alt="User" class="comment-profile-pic">
                      <div class="comment-content">
                          <strong>${data.User.username}</strong>
                          <p>${data.content}</p>
                      </div>
                  </div>
              `;

      // If we are inside the modal, append to the content
      // Note: The structure depends on how comments are rendered. 
      // Assuming a simple append for now.
      commentsList.insertAdjacentHTML('beforeend', commentHtml);
    });

    channel.bind('comment-deleted', (data) => {
      const commentElem = document.getElementById(`comment-${data.commentId}`);
      if (commentElem) commentElem.remove();
    });
  }
}
function closeCommentsModal() {
  document.getElementById('commentsModal').style.display = "none";
}
// Close modals when clicking outside of them
window.onclick = function (event) {
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
