// src/pages/api/upload-file.js
import { google } from "googleapis";
import { PassThrough } from "stream";
import credentials from "../../googleDriveCredentials.json";

export const prerender = false;

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const stream = new PassThrough();
    stream.end(fileBuffer);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = { name: file.name };
    const media = {
      mimeType: file.type || "application/octet-stream",
      body: stream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      uploadType: "media",
      fields: "id",
    });

    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const fileId = response.data.id;
    const proxyUrl = `/api/get-file?id=${fileId}`; // Proxy URL
    console.log("Generated proxy URL:", proxyUrl);

    return new Response(JSON.stringify({ fileLink: proxyUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error uploading file:", error.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Failed to upload file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}