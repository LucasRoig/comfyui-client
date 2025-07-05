"use server";

import { database } from "../../../@lib/database";
import { actionClient } from "../../../@lib/safe-action";

export const listAllProjectsAction = actionClient.action(async () => {
  const projects = await database.query.project.findMany();
  return projects;
});
