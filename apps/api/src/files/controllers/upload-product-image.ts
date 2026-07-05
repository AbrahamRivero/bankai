import { HTTPException } from "hono/http-exception";

async function uploadProductImage(file: File) {
  const uploadcareKey = process.env.UPLOADCARE_PUBLIC_KEY;
  if (!uploadcareKey) {
    throw new HTTPException(500, { message: "Uploadcare is not configured" });
  }

  const formData = new FormData();
  formData.append("UPLOADCARE_PUB_KEY", uploadcareKey);
  formData.append("file", file, file.name);

  const response = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new HTTPException(400, { message: "Failed to upload file" });
  }

  const data = (await response.json()) as { file: string };
  const cdnUrl = `https://ucarecdn.com/${data.file}/`;

  return {
    secureUrl: cdnUrl,
    optimizedUrl: `${cdnUrl}-/preview/-/format/webp/-/quality/80/`,
  };
}

export default uploadProductImage;
