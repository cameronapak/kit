# kit (Keep in Touch)

With kit (Keep in Touch), staying engaged with your users and promoting your product has never been easier.

[Open kit](https://kit.faith.tools)

## Features

- Blog with RSS feed
- Email lead capture
- Simple no-code landing page for your project
- Integration with faith.tools
- HTMX + Alpine.js for interactivity
- Drizzle ORM and Turso for data storage
- Clerk authentication
- Cloudinary image management

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- Bun for installing from the committed lockfile
- Clerk account
- Turso account
- Cloudinary account
- Netlify account (recommended for deployment)

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/cameronapak/kit.git
```

2. Install dependencies

```bash
bun install --frozen-lockfile
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Seed the local SQLite database and start the development server

```bash
bun run db:seed
bun run dev
```

## Available Scripts

- `bun run dev` - Start development server with local SQLite
- `bun run dev:remote` - Start with the configured Turso database
- `bun run dev:host` - Start with network access
- `bun run build` - Check types and build for production
- `bun run preview` - Preview production build
- `bun run db:seed` - Create and seed local SQLite if it does not already exist
- `bun run test` - Check SQLite schema compatibility
- `bun run format` - Format code with Prettier
- `bun run update-packages` - Update all packages

## Tech Stack

For a deeper dive into this tech stack, see the [Freedom Stack](https://github.com/cameronapak/freedom-stack).

- [Astro](https://astro.build)
- [Alpine.js](https://alpinejs.dev)
- [HTMX](https://htmx.org)
- [TailwindCSS](https://tailwindcss.com)
- [DaisyUI](https://daisyui.com)
- [Clerk](https://clerk.com)
- [Turso](https://turso.tech)
- [Cloudinary](https://cloudinary.com)

## Deployment

This project is optimized for deployment on Netlify.

Keep `ASTRO_DB_REMOTE_URL` and `ASTRO_DB_APP_TOKEN` configured for Turso. The URL must be available to the build or the Netlify Functions runtime; the token must be available to Functions. No production schema change or re-seeding is needed when upgrading from Astro DB.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Support

Feel free to reach out on [X/Twitter](https://x.com/cameronpak) or [open an issue](https://github.com/cameronapak/kit/issues).

## License

While this project was initially licensed under the Attribution License, it has since been relicensed under the MIT License and is freely available for anyone to use.

This project is licensed under the MIT License - see [LICENSE.md](./LICENSE.md)
