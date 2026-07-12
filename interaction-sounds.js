import { bind, play } from 'https://cdn.jsdelivr.net/npm/cuelume@0.1.0/dist/index.js';

const interactiveSelector = [
  'a[href]',
  'button:not([disabled])',
  'input[type="button"]',
  'input[type="submit"]',
  '[role="button"]',
  'summary'
].join(',');

document.querySelectorAll(interactiveSelector).forEach((element) => {
  if (!element.hasAttribute('data-cuelume-toggle')) {
    element.setAttribute('data-cuelume-toggle', 'press');
  }
});

bind();

document.addEventListener('cuelume:success', () => play('success'));
document.addEventListener('cuelume:error', () => play('whisper'));
