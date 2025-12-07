## Install prisma-generator-drizzle
* clone drizzle generator on your system `git clone https://github.com/LucasRoig/prisma-generator-drizzle.git`
* `cd prisma-generator-drizzle`
* `bun install`
* `cd packages/generator`
* `bun run build`

## Install comfyui-client
* clone it on your system
* In `packages/database/package.json` update prisma-generator-drizzle-lro path to match to one you cloned before
* init submodule `git submodule init && git submodule update`
* install dependencies `pnpm install`
* copy db env file `cp packages/database/.env.sample packages/database/.env`
* Configure database path in the env file
* Run migrations `pnpm db:migrate dev`
* Copy web-app env file `cp apps/web-react-router/.env.local.sample apps/web-react-router/.env.local`
* Configure database path in the env file