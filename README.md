* init submodule `git submodule init && git submodule update`
* install dependencies `pnpm install`
* copy db env file `cp packages/database/.env.sample packages/database/.env`
* Configure database path in the env file
* Run migrations `pnpm --dir packages/database exec prisma migrate dev`
* Copy web-app env file `cp apps/web/.env.local.sample apps/web/.env.local`
* Configure database path in the env file