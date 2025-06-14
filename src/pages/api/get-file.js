import { google } from "googleapis";

const credentials = {
  type: import.meta.env.PUBLIC_CLOUD_ACCOUNT_TYPE,
  project_id: import.meta.env.PUBLIC_CLOUD_PROJECT_ID,
  private_key_id: import.meta.env.PUBLIC_CLOUD_PRIVATE_KEY_ID,
  private_key: import.meta.env.PUBLIC_CLOUD_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: import.meta.env.PUBLIC_CLOUD_CLIENT_EMAIL,
  client_id: import.meta.env.PUBLIC_CLOUD_CLIENT_ID,
  auth_uri: import.meta.env.PUBLIC_CLOUD_AUTH_URI,
  token_uri: import.meta.env.PUBLIC_CLOUD_TOKEN_URI,
  auth_provider_x509_cert_url: import.meta.env
    .PUBLIC_CLOUD_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: import.meta.env.PUBLIC_CLOUD_CLIENT_X509_CERT_URL,
  universe_domain: import.meta.env.PUBLIC_CLOUD_UNIVERSAL_DOMAIN,
};

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
