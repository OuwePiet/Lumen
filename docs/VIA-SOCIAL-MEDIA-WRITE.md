# VIA social media write boundary

VIA does not become a media-storage provider in this release.

## Released in this step

- A logged-in DeSo user may attach up to four image HTTPS URLs and one video HTTPS URL to a controlled public post.
- The server validates URL count, HTTPS scheme, length and embedded credentials before constructing the DeSo `submit-post` transaction.
- The exact media URLs are included in `BodyObj.ImageURLs` and `BodyObj.VideoURLs`.
- A post may contain text, media, or both.
- The exact resulting transaction still requires explicit DeSo Identity approval before VIA submits the signed transaction.

## Storage boundary

- VIA stores no uploaded media file.
- Vercel is not used as permanent media storage.
- Durable DeSo/IPFS media locations remain preferred.
- Arbitrary non-HTTPS media locations are rejected.

## Next media steps

1. Direct DeSo image upload using the official `/api/v0/upload-image` endpoint. This requires a short-lived DeSo Identity JWT immediately before upload; images are limited by DeSo to supported image formats and its current size limit.
2. Video upload stays separate because DeSo's `/api/v0/upload-video` flow returns a one-time upload URL and uses the tus protocol rather than the image upload flow.

Direct upload will not be released until JWT acquisition, file-type/size checks, upload failure handling and the no-VIA-storage boundary are implemented and tested separately.
