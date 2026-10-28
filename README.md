# Angular Menu App

Angular 18 standalone-component app with a role-based menu: **Home**, **Orders**, **Products**, **Admin**.

## Run

```bash
npm install
npm start        # http://localhost:4200
```

## Demo accounts

| Username | Password    | Role     | Can open                          |
|----------|-------------|----------|-----------------------------------|
| admin    | admin123    | admin    | Home, Orders, Products, Admin     |
| manager  | manager123  | manager  | Home, Orders, Products            |
| customer | customer123 | customer | Home, Products                    |
| (guest)  | n/a         | none     | Home                              |

## Where things are

| Feature            | File                                  |
|--------------------|---------------------------------------|
| Menu + access rules| `src/app/core/menu.ts`                |
| Roles and models   | `src/app/core/models.ts`              |
| Auth (signals)     | `src/app/core/auth.service.ts`        |
| Route guards       | `src/app/core/guards.ts` (`authGuard`, `roleGuard`, `guestGuard`) |
| HTTP interceptor   | `src/app/core/auth.interceptor.ts`    |
| Dummy service      | `src/app/core/dummy-data.service.ts` (reads `src/assets/data/*.json`) |
| Routes (lazy)      | `src/app/app.routes.ts`               |
| App shell          | `src/app/app.component.ts`            |

## Guards

- `authGuard`: signed-in users only, otherwise redirects to `/login?returnUrl=...`.
- `roleGuard`: reads `data.roles` from the route; signed-out users go to login, wrong role goes to `/forbidden`.
- `guestGuard`: sends already signed-in users away from `/login`.

## Interceptor

Adds `Authorization: Bearer <token>` to relative URLs, drives a global loading indicator, handles 401 (sign out and redirect) and 403 (redirect to Access denied), and announces errors to screen readers.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, `lang="en"`.
- `aria-current="page"` on the active menu link; menu only lists pages the user may open.
- Unique `<title>` per route; after navigation the page change is announced via an `aria-live` region and focus moves to `main`.
- Labelled form controls, `role="alert"` and `aria-invalid` / `aria-describedby` on login errors.
- Data tables with `<caption>` and `scope` headers; status shown as text, not colour alone.
- Visible focus ring, 44px touch targets, `prefers-reduced-motion` and forced-colors support.

## Note

Credentials and tokens are hard-coded demo values. Replace `AuthService` and `DummyDataService` with real API calls for production use.
