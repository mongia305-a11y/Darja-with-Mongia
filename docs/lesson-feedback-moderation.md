# Lesson feedback draft — awaiting Mongia's approval

This draft adds one feedback section immediately after each lesson's sharing section on the seven current published lessons. Existing lesson HTML is preserved verbatim; only new includes and sections are inserted.

## Proposed arrangement requiring approval

Reuse the existing FormSubmit endpoint already used by contact.js:
https://formsubmit.co/contact@darjawithmongia.com

Submissions go privately to contact@darjawithmongia.com. A first name or nickname is required; a star rating and comment are optional individually, but at least one is required. No visitor email is collected. A separate, unchecked permission box controls whether the visitor permits public publication.

Email delivery/activation must be verified by Mongia. Automated checks used simulated responses and did not send test messages.

There is no approval dashboard or automatic publication in this arrangement. Mongia reviews the emails. An approved review is added to lesson-feedback-approved.json in a website update. This may be done by Mongia or by an assistant after Mongia explicitly supplies and approves the exact public text. Never store raw submissions, visitor emails, or private feedback in the repository.

## Publication rules

Publish both positive and critical legitimate feedback. Remove spam and abuse.
Only add entries with documented publication permission. Entries must include approved: true and publishConsent: true.
The public data file starts empty. No average or reviews are shown until genuine approved feedback exists.
Use a null rating for a comment-only question; do not count such questions in the star average.
Replies are optional and must be supplied or approved by Mongia.

Each lesson filename maps to its own reviews array. Entry fields:
- nickname: public first name or nickname, at most 60 characters
- rating: integer 1–5, or null
- comment: plain text, at most 1500 characters; may be empty if a rating exists
- date: YYYY-MM-DD publication date
- approved: true
- publishConsent: true
- reply: optional public plain-text reply from Mongia, at most 1500 characters

No review structured data or promises about Google stars are added.

## Validation completed

Sharing: copied URL, clipboard failures and fallback, native sharing support/cancel/failure, exact per-lesson URLs, additive source preservation.
Feedback: rating bounds/types, required content, whitespace-only nickname, private default, opt-in publication, per-lesson filtering, success/failure/activation handling, honeypot, plain-text rendering, no automatic publication.
No browser rendering or real email delivery was verified because the execution environment was unavailable.

## Before enabling

1. Obtain Mongia's approval for the FormSubmit email-and-manual-publication arrangement.
2. Inspect current main for concurrent changes and preserve them.
3. Include the new CSS, JS, public JSON and seven additive HTML changes.
4. Verify FormSubmit activation and actual receipt with an owner-authorized test.
