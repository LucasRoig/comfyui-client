/*
  Warnings:

  - A unique constraint covering the columns `[project_id,name]` on the table `template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "template_name_idx" ON "template"("name");

-- CreateIndex
CREATE UNIQUE INDEX "template_project_id_name_key" ON "template"("project_id", "name");
