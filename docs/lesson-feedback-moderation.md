# Lesson feedback — live setup

Owner approval: Mongia requested "ok make it alive" on 2026-10-20.
The compact toolbar, popup form and approved review display are included on all seven published lesson pages.

## Incoming feedback

The form reuses the existing contact service at FormSubmit:
https://formsubmit.co/contact@darjawithmongia.com
The browser submits to its /ajax/ endpoint. Feedback is addressed to contact@darjawithmongia.com.
The email subject identifies the lesson. The payload includes nickname, rating or comment-only marker, comment, lesson path, canonical lesson URL, and explicit publication permission.
A nickname is required. A rating or comment is required. Visitor email is not collected.
The permission checkbox is initially unchecked. "No" or missing consent means private feedback only.

No real submission or inbox receipt has been verified by the assistant. The owner should submit one real test from a lesson and verify receipt. If FormSubmit requests activation, confirm the service email before relying on incoming reviews.

## Moderation and publication

This setup uses email review followed by a manual website update. It does not provide an approval dashboard or automatic email-to-website publication.

1. Read the submission in contact@darjawithmongia.com.
2. Confirm the visitor allowed public publication. Never publish private feedback.
3. Approve legitimate positive and critical feedback; reject spam, abuse, or exposed personal information.
4. Add the approved entry under its exact lesson filename in lesson-feedback-approved.json.
5. Publish the website update. The approved comment and/or rating appears under that lesson only.

An assistant can perform step 4 after Mongia supplies and approves the exact public text. Do not invent comments, ratings or replies.
Raw submissions and visitor contact details must stay out of the public repository.
The data file starts empty. Reviews and averages stay hidden until genuine approved entries exist.
Only numerical ratings count toward the average; comment-only questions use a null rating.
The approved public JSON contains only:
- nickname: public name, nonempty, at most 60 characters
- rating: integer from 1 to 5, or null
- comment: plain text, at most 1500 characters; may be empty if a rating exists
- date: YYYY-MM-DD publication date
- approved: true
- publishConsent: true
- reply: optional public plain-text reply by Mongia, at most 1500 characters

## Preservation and validation

Only the previously added sharing block and its two resource includes are replaced by the approved compact component.
All other lesson source is preserved byte for byte, including audio, exercises, navigation, analytics and consent behavior.
Old sharing resource files remain in the repository. Existing previews remain available.
The new styles and event handlers are scoped to the component. No local storage, tracking or changes to global theme settings are introduced.

Checks used simulated browser and service responses: popup selection/close/focus/fallback; submission success/network errors/rejection/activation; duplicate requests; invalid input/honeypot; public opt-in and private default; comment-only submissions; per-lesson review filtering; plain-text rendering; clipboard/native sharing; unchanged original lesson source.
Browser rendering and inbox delivery were not verified because the execution environment was unavailable.
