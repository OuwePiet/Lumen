# VIA — controlled DeSo image upload

Status: implementation candidate on `via-direct-image-upload-audit`.

## Boundary

VIA does not introduce permanent VIA/Vercel media storage. Direct image upload uses the documented DeSo media endpoint and stores only the returned HTTPS image URL in the later DeSo post transaction.

## Flow

1. User must already have an active VIA DeSo Identity session with access level 2 or higher.
2. User explicitly chooses one image.
3. VIA checks MIME type and size before requesting credentials for upload.
4. VIA asks the official DeSo Identity iframe for a short-lived JWT immediately before upload.
5. If Safari/iOS requires Identity storage access, the official Identity iframe is shown so the user can grant it.
6. VIA forwards the file, public key and short-lived JWT to `/api/via/social/image-upload`.
7. That route accepts only GIF, JPEG, PNG or WebP smaller than 10 MB and forwards the multipart request to DeSo `/api/v0/upload-image`.
8. VIA accepts only a valid HTTPS `ImageURL` response and inserts that URL into the existing post composer.
9. Uploading the image does not publish a post. Publishing still uses the existing prepare → exact DeSo Identity approval → signed transaction submit path.

## Security rules

- JWT is requested only immediately before upload and is never persisted by VIA.
- No JWT is written to local storage, logs, URL parameters or post metadata.
- VIA never signs the post transaction itself.
- The upload endpoint is fixed; the client cannot choose an arbitrary upstream host.
- Server and client both enforce image type and <10 MB size.
- Maximum four image URLs remain enforced by the post route.
- Direct video upload is not included here because DeSo documents a separate tokenized tus flow.

## Official DeSo basis

DeSo Identity documents `jwt` at access level 2, with tokens valid for 10 minutes and recommends requesting them immediately before endpoints such as `/api/v0/upload-image`.

DeSo media documentation specifies multipart fields `UserPublicKeyBase58Check`, `JWT`, and `file`; supported image formats are GIF/JPEG/PNG/WebP and files must be less than 10 MB. The response contains `ImageURL`.
