import { type NextRequest, NextResponse } from "next/server";
import z from "zod/v4";

export const config = {
  api: {
    bodyParser: false,
  },
};

const schema = z.object({
  relativePath: z.string().transform((s) => (s === "null" ? "/" : s)),
  name: z.string(),
  type: z.string(),
  projectId: z.string(),
  file: z.file(),
});

export async function POST(request: NextRequest) {
  const originalFormData = await request.formData();
  const formDataObj = Object.fromEntries(originalFormData.entries());
  const formDataResult = schema.safeParse(formDataObj);
  if (!formDataResult.success) {
    return NextResponse.json({ error: formDataResult.error.message }, { status: 400 });
  }
  const formData = formDataResult.data;
  const file = formData.file;

  console.log(formData);
  // const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replace(/\s/g, "-");
  // const filepath = path.join(process.cwd(), "public", "uploads", filename);

  // try {
  //   await writeFile(filepath, buffer);
  //   return NextResponse.json({
  //     message: "File uploaded successfully",
  //     filename,
  //   });
  // } catch (error) {
  //   console.error("Error saving file:", error);
  //   return NextResponse.json({ error: "Error saving file" }, { status: 500 });
  // }
  return NextResponse.json({
    message: "File uploaded successfully",
    filename,
  });
}
