# Globed Gremlin Bot

A custom Discord bot for [Globed].
Created using the [D4isDAVID/discord.js-components-bot] template.

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Scripts](#scripts)

## Features

### Daily Gremlins

Moderators can add user submissions to a "gremlins list", from which the bot
will upload random submissions on a daily basis. Optionally, the bot will
re-post the dailies with the most reactions on a monthly basis.

### Auto Forum Polls

Configure a poll that will be created for new posts in a forum channel.

### Calculator

Use a simple calculator through the bot.

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
- `npm run build` - Build your code with the [TypeScript] compiler
- `npm run build:watch` - Build your code in watch mode
- `npm run scrape-gremlins` - Scrape old gremlins
- `npm run deploy` - Deploy commands to Discord
- `npm run start` - Start your bot

### Prisma Scripts

- `npx prisma generate` - Generate artifacts (when the database schema is changed)
- `npx prisma migrate deploy` - Apply pending migrations to the database (or generate it)
- `npx prisma migrate dev` - Create a migration from changes in the database schema

[globed]: https://globed.dev/
[d4isdavid/discord.js-components-bot]: https://github.com/D4isDAVID/discord.js-components-bot
[node.js]: https://nodejs.org
[discord developer portal]: https://discord.com/developers/applications
[prettier]: https://prettier.io
[typescript]: https://typescriptlang.org
