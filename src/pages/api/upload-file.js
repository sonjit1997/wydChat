import { google } from "googleapis";
import { PassThrough } from "stream";

export const prerender = false;

const credentials = {
  type: import.meta.env.PUBLIC_CLOUD_ACCOUNT_TYPE,
  project_id: import.meta.env.PUBLIC_CLOUD_PROJECT_ID,
  private_key_id: import.meta.env.PUBLIC_CLOUD_PRIVATE_KEY_ID,
  private_key: import.meta.env.PUBLIC_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: import.meta.env.PUBLIC_CLOUD_CLIENT_EMAIL,
  client_id: import.meta.env.PUBLIC_CLOUD_CLIENT_ID,
  auth_uri: import.meta.env.PUBLIC_CLOUD_AUTH_URI,
  token_uri: import.meta.env.PUBLIC_CLOUD_TOKEN_URI,
  auth_provider_x509_cert_url:
    import.meta.env.PUBLIC_CLOUD_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: import.meta.env.PUBLIC_CLOUD_CLIENT_X509_CERT_URL,
  universe_domain: import.meta.env.PUBLIC_CLOUD_UNIVERSAL_DOMAIN,
};


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
    // eslint-disable-next-line no-undef
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
    console.error(
      "Error uploading file:",
      error.response?.data || error.message
    );
    return new Response(JSON.stringify({ error: "Failed to upload file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
