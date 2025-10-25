import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/api/orpc/*", "routes/api/orpc.ts")
] satisfies RouteConfig;
