import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

export const AppRoutes = {
  project: {
    list: "/",
    dashboard: (id: string) => `/projects/${id}/dashboard`,
    allFiles: (id: string) => `/projects/${id}/files`,
    importTasks: (id: string) => `/projects/${id}/import-tasks`,
    workflows: (id: string) => `/projects/${id}/workflow`,
    exploreCivit: (id: string) => `/projects/${id}/explore/civit`,
  },
};

export default [
  index("routes/home.tsx"),
  route("/api/orpc/*", "routes/api/orpc.ts"),
  ...prefix("projects", [
    layout("routes/projects/project-layout.tsx", [route(":id/dashboard", "routes/projects/project-dashboard.tsx")]),
  ]),
] satisfies RouteConfig;
