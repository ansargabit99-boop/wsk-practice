# Guide - Module D

## Time plan
- 0:00-0:15 Read brief, check API/JSON, set up project
- 0:15-0:45 api.js, router, layout, nav
- 0:45-1:15 Login + route protection
- 1:15-2:00 Gallery list + search/filter/pagination
- 2:00-2:25 Detail view
- 2:25-2:50 Upload with preview
- 2:50-3:00 Accessibility + security pass, test in Chrome and Firefox

## Central API wrapper
```js
const BASE = 'http://localhost:3000/api';
export async function api(path, { method='GET', body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: form || (body && JSON.stringify(body)) });
  if (res.status === 401) { localStorage.removeItem('token'); location.hash = '#/login'; throw new Error('Unauthorized'); }
  if (!res.ok) throw await res.json();
  return res.status === 204 ? null : res.json();
}
```

## Upload preview
```js
input.addEventListener('change', () => {
  const f = input.files[0];
  if (!['image/jpeg','image/png'].includes(f.type) || f.size > 2*1024*1024) return showError('JPG/PNG up to 2MB');
  preview.src = URL.createObjectURL(f);
});
```

## Safe rendering
Use `el.textContent = photo.title` or framework bindings, never `innerHTML` with API data.

## Checklist
- [ ] Protected routes redirect when logged out
- [ ] Loading/empty/error states exist
- [ ] Upload validates and previews
- [ ] Tab through the whole app with keyboard
- [ ] No console errors in Chrome and Firefox
