-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "is_root" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "project_id" TEXT NOT NULL,
    CONSTRAINT "template_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "template" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "template_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_template" ("id", "is_root", "name", "parent_id", "project_id") SELECT "id", "is_root", "name", "parent_id", "project_id" FROM "template";
DROP TABLE "template";
ALTER TABLE "new_template" RENAME TO "template";
CREATE INDEX "template_name_idx" ON "template"("name");
CREATE UNIQUE INDEX "template_project_id_name_key" ON "template"("project_id", "name");
CREATE TABLE "new_template_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    CONSTRAINT "template_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_template_field" ("field_id", "field_label", "id", "position", "template_id") SELECT "field_id", "field_label", "id", "position", "template_id" FROM "template_field";
DROP TABLE "template_field";
ALTER TABLE "new_template_field" RENAME TO "template_field";
CREATE INDEX "template_field_field_label_idx" ON "template_field"("field_label");
CREATE UNIQUE INDEX "template_field_template_id_field_id_key" ON "template_field"("template_id", "field_id");
CREATE TABLE "new_template_input_image_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_input_image_field_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "template_field" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "template_input_image_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_input_image_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_template_input_image_field" ("field_id", "id", "parent_field_id") SELECT "field_id", "id", "parent_field_id" FROM "template_input_image_field";
DROP TABLE "template_input_image_field";
ALTER TABLE "new_template_input_image_field" RENAME TO "template_input_image_field";
CREATE UNIQUE INDEX "template_input_image_field_field_id_key" ON "template_input_image_field"("field_id");
CREATE TABLE "new_template_string_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_string_field_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "template_field" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "template_string_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_string_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_template_string_field" ("field_id", "id", "parent_field_id") SELECT "field_id", "id", "parent_field_id" FROM "template_string_field";
DROP TABLE "template_string_field";
ALTER TABLE "new_template_string_field" RENAME TO "template_string_field";
CREATE UNIQUE INDEX "template_string_field_field_id_key" ON "template_string_field"("field_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
