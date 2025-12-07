import { index, layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

export const AppRoutes = {
  api: {
    uploadFile: "/api/upload-file",
  },
  project: {
    list: "/",
    dashboard: (projectId: string) => `/projects/${projectId}/dashboard`,
    allFiles: (projectId: string) => `/projects/${projectId}/files`,
    importTasks: (projectId: string) => `/projects/${projectId}/import-tasks`,
    workflows: (projectId: string) => `/projects/${projectId}/workflows`,
    exploreCivit: (projectId: string) => `/projects/${projectId}/explore/civit`,
    templates: (projectId: string) => `/projects/${projectId}/templates`,
    editTemplate: (args: { projectId: string; templateId: string }) =>
      `/projects/${args.projectId}/templates/${args.templateId}/edit`,
  },
};

export default [
  index("routes/home.tsx"),
  route("/api/orpc/*", "routes/api/orpc.ts"),
  route("/api/upload-file", "routes/api/upload-file.ts"),
  ...prefix("projects", [
    layout("routes/projects/project-layout.tsx", [
      route(":projectId/dashboard", "routes/projects/project-dashboard.tsx"),
      route(":projectId/files", "routes/projects/files/project-all-files.tsx"),
      route(":projectId/import-tasks", "routes/projects/files/project-import-tasks.tsx"),
      route(":projectId/workflows", "routes/projects/other/project-workflows.tsx"),
      route(":projectId/explore/civit", "routes/projects/other/project-explore-civit.tsx"),
      route(":projectId/templates", "routes/projects/project-templates.tsx"),
      route(":projectId/templates/:templateId/edit", "routes/projects/templates/project-edit-template.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
