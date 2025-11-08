import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

export const AppRoutes = {
  project: {
    list: "/",
    dashboard: (id: string) => `/projects/${id}/dashboard`,
    allFiles: (id: string) => `/projects/${id}/files`,
    importTasks: (id: string) => `/projects/${id}/import-tasks`,
    workflows: (id: string) => `/projects/${id}/workflows`,
    exploreCivit: (id: string) => `/projects/${id}/explore/civit`,
    templates: (id: string) => `/projects/${id}/templates`,
  },
};

export default [
  index("routes/home.tsx"),
  route("/api/orpc/*", "routes/api/orpc.ts"),
  ...prefix("projects", [
    layout("routes/projects/project-layout.tsx", [
      route(":id/dashboard", "routes/projects/project-dashboard.tsx"),
      route(":id/files", "routes/projects/files/project-all-files.tsx"),
      route(":id/import-tasks", "routes/projects/files/project-import-tasks.tsx"),
      route(":id/workflows", "routes/projects/other/project-workflows.tsx"),
      route(":id/explore/civit", "routes/projects/other/project-explore-civit.tsx"),
      route(":id/templates", "routes/projects/project-templates.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
