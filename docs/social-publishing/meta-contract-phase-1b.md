# RQS Social Publishing — Meta Contract (Phase 1B)

Checked on: 2026-09-23

## Official contract

- Current Graph API version: `v26.0`, released on 2026-07-29.
- Selected integration model: Instagram API with Facebook Login.
- Instagram publishing requires an Instagram Professional account (Business or Creator) linked to a Facebook Page.
- The linked Page is resolved with `/{user-id}/accounts?fields=name,access_token,tasks,instagram_business_account` and supplies the Page Access Token used by the selected Instagram flow.
- Instagram feed and Reels publishing require `instagram_basic`, `instagram_content_publish`, `pages_show_list`, and `pages_read_engagement`.
- The current Page Posts guide lists `pages_manage_engagement`, `pages_manage_posts`, `pages_read_engagement`, and `pages_read_user_engagement`; Page discovery uses `pages_show_list`. The guide also requires `publish_video` when publishing Page video, so RQS requires it for the Facebook Reel capability. The authenticating user must have `CREATE_CONTENT`, `MANAGE`, and `MODERATE` Page tasks or their full-control equivalents.
- Instagram Reels use a server-hosted, publicly reachable `video_url`. Facebook Reels accept a hosted CDN URL or local binary upload. Phase 1B performs neither flow.
- Instagram Stories are documented only for Business accounts. RQS keeps Stories disabled until the configured account type and a separate Owner gate explicitly authorize that capability.
- A short-lived User Access Token can be exchanged server-side for a long-lived token. The official example reports approximately 60 days (`expires_in` near 5.18 million seconds). A long-lived Page Access Token derived from that User token has no fixed expiration date, but Meta states that it can expire or be invalidated under documented conditions; diagnostics therefore inspect validity and reported expiry instead of assuming permanence.
- Development-mode testing is limited to app-role users and owned test/managed assets. Use outside app roles requires the relevant permissions/features with Advanced Access through App Review; Meta may require Business Verification.

## Server configuration

The chosen Facebook Login contract uses one linked Page Access Token for both Page and Instagram identity checks:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_FACEBOOK_PAGE_ID`
- `META_FACEBOOK_PAGE_ACCESS_TOKEN`
- `META_IG_USER_ID`

Secrets are server-only. They must not be stored in Firestore, Social Packages, browser storage, client code, diagnostics, or logs.

## Current account and capability audit

The Vercel environment-variable inventory was checked by name on 2026-09-23. None of the five `META_*` variables above exists in Preview or Production, so Phase 1B diagnostics will correctly report `NOT_CONFIGURED` and make zero Meta calls.

Owner actions still required before a manual pilot:

1. Confirm or create a Meta Business app owned by the appropriate verified RQS business portfolio.
2. Confirm the target Facebook Page and that the authenticating person has content-creation/full-control tasks.
3. Confirm the Instagram account is Professional (Business or Creator) and linked to that exact Page.
4. Request the publishing permissions with the access level required for the intended app users; complete App Review and Business Verification when Meta requires them.
5. Generate the User/Page token flow outside chat, store the resulting Page Access Token as a Vercel Sensitive environment variable, and record an Owner-controlled renewal/revocation procedure.
6. Run diagnostics and confirm Page identity, Instagram identity, linkage, token/app match, permissions, and expiry before authorizing any publication pilot.

## Phase 1B boundaries

- Diagnostics use read-only Graph API `GET` requests only.
- No media container, upload session, post, Reel, Story, or `media_publish` request is created.
- `publishingEnabled` is always `false`.
- Deliveries only define the future document shape and idempotency/reconciliation decisions.

## Official sources

- https://developers.facebook.com/docs/graph-api/changelog/version26.0/
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/overview/
- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/content-publishing/
- https://developers.facebook.com/docs/pages-api/posts/
- https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- https://www.postman.com/meta/facebook/folder/simabyk/reels-publishing
- https://developers.facebook.com/docs/facebook-login/guides/access-tokens/
- https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/
- https://developers.facebook.com/docs/app-review/
