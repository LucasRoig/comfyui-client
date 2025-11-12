-- CreateTable
CREATE TABLE "template_string_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_string_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "template_string_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_string_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "template_input_image_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_input_image_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "template_input_image_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_input_image_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "template_output_image_field" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "field_id" TEXT NOT NULL,
    "field_label" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "parent_field_id" TEXT NOT NULL,
    CONSTRAINT "template_output_image_field_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "template_output_image_field_parent_field_id_fkey" FOREIGN KEY ("parent_field_id") REFERENCES "template_output_image_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "template_string_field_field_label_idx" ON "template_string_field"("field_label");

-- CreateIndex
CREATE UNIQUE INDEX "template_string_field_template_id_field_id_key" ON "template_string_field"("template_id", "field_id");

-- CreateIndex
CREATE INDEX "template_input_image_field_field_label_idx" ON "template_input_image_field"("field_label");

-- CreateIndex
CREATE UNIQUE INDEX "template_input_image_field_template_id_field_id_key" ON "template_input_image_field"("template_id", "field_id");

-- CreateIndex
CREATE INDEX "template_output_image_field_field_label_idx" ON "template_output_image_field"("field_label");

-- CreateIndex
CREATE UNIQUE INDEX "template_output_image_field_template_id_field_id_key" ON "template_output_image_field"("template_id", "field_id");
