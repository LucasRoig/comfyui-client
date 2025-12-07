-- CreateTable
CREATE TABLE "string_field_value" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL DEFAULT '',
    "template_field_id" TEXT NOT NULL,
    "input_image_id" TEXT NOT NULL,
    CONSTRAINT "string_field_value_template_field_id_fkey" FOREIGN KEY ("template_field_id") REFERENCES "template_string_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "string_field_value_input_image_id_fkey" FOREIGN KEY ("input_image_id") REFERENCES "input_image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "output_field_value" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "output_image_id" TEXT,
    "template_field_id" TEXT NOT NULL,
    "input_image_id" TEXT NOT NULL,
    CONSTRAINT "output_field_value_output_image_id_fkey" FOREIGN KEY ("output_image_id") REFERENCES "output_image" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "output_field_value_template_field_id_fkey" FOREIGN KEY ("template_field_id") REFERENCES "template_output_image_field" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "output_field_value_input_image_id_fkey" FOREIGN KEY ("input_image_id") REFERENCES "input_image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "string_field_value_template_field_id_input_image_id_key" ON "string_field_value"("template_field_id", "input_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "output_field_value_template_field_id_input_image_id_key" ON "output_field_value"("template_field_id", "input_image_id");
