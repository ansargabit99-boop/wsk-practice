# Guide - Module A

## Time plan
- 0:00-0:10 Read brief, list pages/sections/breakpoints
- 0:10-0:50 Semantic HTML for all pages (no styling)
- 0:50-1:20 CSS variables, reset, typography, shared header/footer
- 1:20-2:20 Page layouts mobile-first, then tablet/desktop media queries
- 2:20-2:40 Accessibility pass
- 2:40-3:00 W3C validation, cross-browser check at 3 widths

## Steps
1. Semantic tags: header, nav, main, section, article, footer. One h1 per page.
2. CSS variables on :root for colors, font sizes, spacing.
3. Mobile-first: base styles for mobile, then @media (min-width: 768px) and (min-width: 1200px).
4. Use Grid for card layouts: `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));`
5. Images: `max-width:100%; height:auto;` plus `<picture>`/`srcset` where useful.
6. Video: `<video controls>` with `<source>` and fallback text.
7. Accessibility: alt text, `<label for>`, `:focus-visible` outlines, skip link, aria-label on nav, contrast check.
8. Validate at validator.w3.org and jigsaw.w3.org/css-validator. Fix everything.

## Checklist
- [ ] 3 viewports look right
- [ ] No horizontal scroll on mobile
- [ ] Every image has alt
- [ ] Keyboard-only navigation works
- [ ] 0 validator errors
- [ ] Chrome + Firefox tested

## Tip
Match the supplied design exactly (spacing, colors, fonts). It is the cheapest way to score.
