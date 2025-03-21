Project conventions
- Code must run entirely client-side (i.e. in-browser)
- Prefer solutions not requiring a build step - such as vanilla HTML/JS/CSS
- Minimize use of dependencies, and vendor them
  E.g. if using HTMX, ensure (by providing instructions or executing commands) it's downloaded into the project sources, and referenced accordingly,
  as opposed to being loaded client-side from a CDN. I.e. `js/library.js` is OK, `https://cdn.blahblah/library.js` is not.
