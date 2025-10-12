import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { drizzleSchema } from "@repo/database";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import z from "zod/v4";
import { database } from "../../../@lib/database";
import { getServerSideEnv } from "../../../@lib/server-side-env";

export const config = {
  api: {
    bodyParser: false,
  },
};

const schema = z.object({
  relativePath: z
    .string()
    .trim()
    .transform((s) => {
      if (s === "null") return "/";
      if (!s.startsWith("/")) return `/${s}`;
      return s;
    }),
  name: z.string(),
  type: z.string(),
  projectId: z.string(),
  uploadId: z.string(),
  file: z.file(),
});

export async function POST(request: NextRequest) {
  const env = getServerSideEnv();
  const originalFormData = await request.formData();
  const formDataObj = Object.fromEntries(originalFormData.entries());
  const formDataResult = schema.safeParse(formDataObj);
  if (!formDataResult.success) {
    return NextResponse.json({ error: formDataResult.error.message }, { status: 400 });
  }

  const formData = formDataResult.data;
  if (!formData.relativePath.endsWith(formData.name)) {
    formData.relativePath = `${formData.relativePath}${formData.relativePath.endsWith("/") ? "" : "/"}${formData.name}`;
  }

  const file = formData.file;
  await database.run("PRAGMA busy_timeout = 10000;");
  const fileId = await database.transaction(async (tx) => {
    const imageId = v4();
    const alreadyExists = await tx.query.inputImage.findFirst({
      where: and(
        eq(drizzleSchema.inputImage.projectId, formData.projectId),
        eq(drizzleSchema.inputImage.originalPath, formData.relativePath),
      ),
    });
    if (alreadyExists) {
      return alreadyExists.id;
    }

    await tx
      .insert(drizzleSchema.importTask)
      .values({
        id: formData.uploadId,
      })
      .onConflictDoNothing();
    await tx.insert(drizzleSchema.inputImage).values({
      id: imageId,
      importTaskId: formData.uploadId,
      originalPath: formData.relativePath,
      originalFileName: formData.name,
      projectId: formData.projectId,
      type: formData.type,
    });

    const fileExtension = path.extname(formData.name);
    const filePath = path.join(env.WORKSPACE, formData.projectId, "input_files", `${imageId}${fileExtension}`);
    const directory = path.dirname(filePath);
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    return imageId;
  });
  return NextResponse.json({
    message: "File uploaded successfully",
    fileId,
  });
}
