// Keep the initial HTML in sync with the data and renderers used by the activities.
// Run from the repository root: node scripts/prerender-lessons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vocabularyPages = [
  'rooms-of-the-house.html',
  'furniture-of-the-house.html',
  'farm-animals.html',
];
const conversationPages = [
  'conversation-01-meeting-someone.html',
  'conversation-lesson-02.html',
];
const checkOnly = process.argv.includes('--check');

function declaration(source, name, bracket) {
  const closing = bracket === '[' ? '\\]' : '\\}';
  const opening = bracket === '[' ? '\\[' : '\\{';
  const expression = new RegExp(`\\bconst\\s+${name}\\s*=\\s*${opening}[\\s\\S]*?\\n[ \\t]*${closing};`);
  const match = source.match(expression);
  if (!match) throw new Error(`Cannot find the ${name} declaration`);
  return match[0];
}

function renderer(source, name) {
  const expression = new RegExp(`(?:^|\\n)([ \\t]*)function\\s+${name}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\1\\}`, 'm');
  const match = source.match(expression);
  if (!match) throw new Error(`Cannot find the ${name} renderer`);
  return match[0];
}

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function documentStub(ids) {
  const elements = new Map(ids.map(id => [id, {
    innerHTML: '',
    appendChild(element) {
      const styles = Object.entries(element.properties).map(([key, value]) => `${key}: ${value}`).join('; ');
      this.innerHTML += `<article class="${escapeAttribute(element.className)}" id="${escapeAttribute(element.id)}" style="${escapeAttribute(styles)}">${element.innerHTML}</article>\n`;
    },
  }]));
  return {
    elements,
    document: {
      getElementById(id) {
        if (!elements.has(id)) throw new Error(`Unexpected element: ${id}`);
        return elements.get(id);
      },
      createElement(tag) {
        if (tag !== 'article') throw new Error(`Unexpected generated element: ${tag}`);
        const element = { className: '', id: '', innerHTML: '', properties: {} };
        element.style = { setProperty: (key, value) => { element.properties[key] = value; } };
        return element;
      },
    },
  };
}

function insertMarkup(source, id, markup) {
  const start = `<!-- prerender:${id}:start -->`;
  const end = `<!-- prerender:${id}:end -->`;
  const content = `${start}\n${markup.trim().split('\n').map(line => line.trimEnd()).join('\n')}\n${end}`;
  if (source.includes(start)) {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from);
    if (to < 0) throw new Error(`Missing end marker for ${id}`);
    return source.slice(0, from) + content + source.slice(to + end.length);
  }
  const expression = new RegExp(`(<div\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>)(?:\\s|<!--[\\s\\S]*?-->)*<\\/div>`);
  if (!expression.test(source)) throw new Error(`Cannot find the empty ${id} container`);
  return source.replace(expression, (_, opening) => `${opening}\n${content}\n</div>`);
}

let stale = false;
for (const name of [...vocabularyPages, ...conversationPages]) {
  const file = resolve(root, name);
  const original = readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  let source = original.replaceAll('\r\n', '\n');
  const vocabulary = vocabularyPages.includes(name);
  const ids = vocabulary ? ['vgrid'] : ['dialogueContainer', 'chunksGrid'];
  const stub = documentStub(ids);
  const context = { document: stub.document, updateProgress() {}, transcriptVisible: true };
  const script = vocabulary
    ? `${declaration(source, 'IMGS', '{')}\n${declaration(source, 'WORDS', '[')}\n${declaration(source, 'SENTENCE_AUDIO', '{')}\n${renderer(source, 'renderVocab')}\nrenderVocab();`
    : `${declaration(source, 'dialogueLines', '[')}\n${declaration(source, 'chunks', '[')}\n${renderer(source, 'renderDialogue')}\n${renderer(source, 'renderChunks')}\nrenderDialogue();\nrenderChunks();`;
  runInNewContext(script, context, { timeout: 1000 });
  for (const id of ids) source = insertMarkup(source, id, stub.elements.get(id).innerHTML);
  const updated = source.replaceAll('\n', eol);
  if (updated !== original) {
    if (checkOnly) {
      console.error(`${name}: initial lesson HTML needs regeneration`);
      stale = true;
    } else {
      writeFileSync(file, updated);
      console.log(`${name}: initial lesson HTML updated`);
    }
  } else {
    console.log(`${name}: initial lesson HTML is current`);
  }
}
if (stale) process.exitCode = 1;
