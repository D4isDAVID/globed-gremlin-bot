# Globed Gremlin Bot

A Discord bot that posts daily gremlins submitted by members and accepted by moderators.
Created using the [D4isDAVID/discord.js-components-bot] template.

- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Scripts](#scripts)

## Prerequisites

- [Node.js] v20+.
- A bot in the [Discord Developer Portal].
  - Must have the **Message Content** intent enabled under the "Bot" section.

## Configuration

- Make a copy of the [`.env.example`](./.env.example) file
- Name the new copy `.env`
- Configure the file

## Scripts

- `npm run lint` - Lint your code with [Prettier]
- `npm run format` - Format your code with [Prettier]
- `npm run clean` - Delete the built code
- `npm run build` - Build your code with the [TypeScript] compiler
- `npm run build:watch` - Build your code in watch mode
- `npm run scrape-gremlins` - Scrape old gremlins
- `npm run deploy` - Deploy commands to Discord
- `npm run start` - Start your bot

### Prisma Databse Scripts

- `npx prisma generate` - Generate artifacts (when the database schema is changed)
- `npx prisma migrate deploy` - Apply pending migrations to the database (or generate it)
- `npx prisma migrate dev` - Create a migration from changes in the database schema

[d4isdavid/discord.js-components-bot]: https://github.com/D4isDAVID/discord.js-components-bot
[node.js]: https://nodejs.org
[discord developer portal]: https://discord.com/developers/applications
[prettier]: https://prettier.io
[typescript]: https://typescriptlang.org
