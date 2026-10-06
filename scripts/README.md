# Updating lesson text

The three vocabulary lessons and two conversation lessons include their words,
example sentences and expressions in the initial HTML. The existing JavaScript
still controls audio, flashcards, quizzes, role-play and transcript visibility.

After changing a lesson's `WORDS`, `IMGS`, `SENTENCE_AUDIO`, `dialogueLines`,
`chunks` or its card renderer, run this command before committing:

```sh
node scripts/prerender-lessons.mjs
```

To check that the HTML matches the current lesson data:

```sh
node scripts/prerender-lessons.mjs --check
```

When publishing a new lesson, add its preferred public URL to `sitemap.xml`, add
a unique title and description, and link it from `free-lessons.html` and relevant
existing lessons.
