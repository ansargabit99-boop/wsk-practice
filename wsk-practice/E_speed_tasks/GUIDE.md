# Guide - Module E

## Strategy
1. First 10 min: read ALL tasks, rank by points / time.
2. Easy first to bank points, then medium, then hard.
3. Timebox: easy 10 / medium 20 / hard 35 min. At the limit, move on and return later.
4. Make it work first, polish later. A working basic version beats a half-finished perfect one.
5. Final 10 min: W3C validation for HTML/CSS tasks, test in Chrome and Firefox.

## Snippet library to memorize
```js
// debounce
const debounce = (fn, ms) => { let t; const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; d.cancel = () => clearTimeout(t); return d; };
// sort
rows.sort((a,b) => dir * (isNaN(a[k]) ? a[k].localeCompare(b[k]) : a[k]-b[k]));
// event delegation
list.addEventListener('click', e => { const btn = e.target.closest('[data-id]'); if (!btn) return; /* ... */ });
// also: fetch wrapper, modal, tabs, form validation, localStorage theme
```

## Practice routine
Do tasks 1-10 in 3 hours. Redo the ones you failed, faster. Repeat weekly with new variations (carousel, modal with focus trap, tabs, infinite scroll, countdown timer, star rating, debounced search).
