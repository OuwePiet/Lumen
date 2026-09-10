# VIA video composer integration

The direct DeSo video flow is now part of the Post Composer user experience while remaining technically separate from blockchain publishing.

- Logged-in user selects one video in the composer.
- VIA uses the existing guarded DeSo tokenized tus upload path.
- The current DeSo backend size ceiling of 250 MB is enforced before upload.
- Post preparation is disabled while upload or processing is still active.
- VIA waits until the stream reports ready.
- The resulting HTTPS video URL is inserted into the same post draft automatically.
- VIA keeps no permanent video copy.
- Uploading a video never publishes a post.
- Final publishing still requires the existing explicit DeSo Identity transaction review and approval.

This removes the former manual copy/paste handoff without weakening VIA's participation, transaction or storage boundaries.