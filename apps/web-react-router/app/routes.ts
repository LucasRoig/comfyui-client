import { index, type RouteConfig, route } from "@react-router/dev/routes";

export const Routes = {
  project: {
    list: "/",
    view: (id: string) => `/projects/${id}`,
  },
};

export default [index("routes/home.tsx"), route("/api/orpc/*", "routes/api/orpc.ts")] satisfies RouteConfig;
