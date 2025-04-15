import { google } from "googleapis";
import credentials from "../../googleDriveCredentials.json";

export async function GET({ url }) {
  try {
    const fileId = url.searchParams.get("id");
    if (!fileId) {
      return new Response(JSON.stringify({ error: "No file ID provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    return new Response(response.data, {
      status: 200,
      headers: {
        "Content-Type": response.headers["content-type"],
        "Cache-Control": "public, max-age=31536000", 
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}