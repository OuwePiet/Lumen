# VIA direct video integration

VIA keeps video upload separate from blockchain publishing, but the user-facing flow now stays inside the Post Composer.

- A logged-in user chooses one video in the composer.
- VIA uses the existing DeSo-compatible tokenized tus upload path.
- The current DeSo backend size ceiling of 250 MB is enforced before upload.
- VIA waits until the stream reports ready before attaching its HTTPS iframe URL to the post draft.
- VIA does not keep a permanent copy of the video.
- Uploading a video never publishes a post.
- The final post still goes through the existing explicit DeSo Identity transaction review/signing boundary.

This removes the manual copy/paste handoff between a separate video control and the post composer without weakening the transaction boundary.