import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "products");

export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload payload." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPG, PNG, WEBP, AVIF or GIF." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (max 4 MB)." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  } catch {
    return NextResponse.json(
      { error: "Could not save the image on the server." },
      { status: 500 },
    );
  }

  // Product images are served from /public/products/<filename>; the Product
  // record stores just the bare filename.
  return NextResponse.json({ filename, url: `/products/${filename}` });
}
