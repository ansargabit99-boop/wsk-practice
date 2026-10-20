# Module D - Interactive Frontend Using an API (3h)

## Task
Build a SPA "PhotoBox" photo gallery. Use your own API (adapt Module B, or add /api/photos) or the provided JSON files in `data/` as a fallback.

## Features
1. Login page; token stored; protected routes; logout; redirect to login on 401.
2. Gallery: grid of photos with title, author, tags; search by title; filter by tag; pagination or "load more".
3. Photo details view (route like #/photos/3) with back navigation.
4. Upload: form (title, tags, file) with client validation (JPG/PNG, max 2MB), live preview, success/error message.
5. States: loading, empty, error on every data view.
6. Accessibility: keyboard usable, labels, alt text, visible focus, aria-live for messages, semantic markup, responsive.
7. Security: never inject API data with innerHTML; handle expired token.

Stack: vanilla JS (hash router) or Vue/React/Svelte, your choice.
