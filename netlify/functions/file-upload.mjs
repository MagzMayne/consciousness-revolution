// File Upload Function - Netlify Blobs Storage
// Handles file uploads with multi-method fallback support

import { getStore } from "@netlify/blobs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

export async function handler(event, context) {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  try {
    // Use Netlify Blobs with explicit credentials
    const store = getStore({
      name: "file-uploads",
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN
    });
    const params = event.queryStringParameters || {};

    // GET - List files or get specific file
    if (event.httpMethod === "GET") {
      const fileId = params.id;

      if (fileId) {
        // Get specific file
        const blob = await store.get(fileId, { type: "arrayBuffer" });
        if (!blob) {
          return response(404, { error: "File not found" });
        }

        // Get metadata
        const metadata = await store.getMetadata(fileId);
        const contentType = metadata?.metadata?.contentType || "application/octet-stream";
        const filename = metadata?.metadata?.filename || fileId;

        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
          body: Buffer.from(blob).toString("base64"),
          isBase64Encoded: true
        };
      } else {
        // List all files
        const { blobs } = await store.list();
        const files = await Promise.all(
          blobs.map(async (blob) => {
            const meta = await store.getMetadata(blob.key);
            return {
              id: blob.key,
              filename: meta?.metadata?.filename || blob.key,
              size: meta?.metadata?.size || 0,
              contentType: meta?.metadata?.contentType || "unknown",
              uploadedAt: meta?.metadata?.uploadedAt || null,
              uploadedBy: meta?.metadata?.uploadedBy || "unknown"
            };
          })
        );

        return response(200, { files, count: files.length });
      }
    }

    // POST - Upload file
    if (event.httpMethod === "POST") {
      const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";

      let fileData, filename, originalContentType, uploadedBy;

      if (contentType.includes("multipart/form-data")) {
        // Parse multipart form data manually
        const boundary = contentType.split("boundary=")[1];
        if (!boundary) {
          return response(400, { error: "Invalid multipart boundary" });
        }

        const body = event.isBase64Encoded
          ? Buffer.from(event.body, "base64").toString("binary")
          : event.body;

        // Simple multipart parser
        const parts = body.split(`--${boundary}`);
        let filePart = null;
        let filenamePart = null;
        let uploadedByPart = null;

        for (const part of parts) {
          if (part.includes('name="file"')) {
            // Extract file content (after double CRLF)
            const headerEnd = part.indexOf("\r\n\r\n");
            if (headerEnd !== -1) {
              filePart = part.substring(headerEnd + 4).replace(/\r\n--$/, "");
              // Extract filename from Content-Disposition
              const filenameMatch = part.match(/filename="([^"]+)"/);
              if (filenameMatch) filenamePart = filenameMatch[1];
              // Extract content type
              const ctMatch = part.match(/Content-Type:\s*(.+)/i);
              if (ctMatch) originalContentType = ctMatch[1].trim();
            }
          } else if (part.includes('name="filename"')) {
            const headerEnd = part.indexOf("\r\n\r\n");
            if (headerEnd !== -1) {
              filenamePart = part.substring(headerEnd + 4).trim().replace(/\r\n--$/, "");
            }
          } else if (part.includes('name="uploadedBy"')) {
            const headerEnd = part.indexOf("\r\n\r\n");
            if (headerEnd !== -1) {
              uploadedByPart = part.substring(headerEnd + 4).trim().replace(/\r\n--$/, "");
            }
          }
        }

        if (!filePart) {
          return response(400, { error: "No file provided" });
        }

        filename = filenamePart || `file_${Date.now()}`;
        fileData = Buffer.from(filePart, "binary");
        originalContentType = originalContentType || "application/octet-stream";
        uploadedBy = uploadedByPart || "mobile-widget";

      } else if (contentType.includes("application/json")) {
        // Handle base64 JSON upload
        const body = JSON.parse(event.body);
        filename = body.filename || `file_${Date.now()}`;
        fileData = Buffer.from(body.data, "base64");
        originalContentType = body.contentType || "application/octet-stream";
        uploadedBy = body.uploadedBy || "mobile-widget";

      } else {
        // Handle raw binary
        filename = params.filename || `file_${Date.now()}`;
        fileData = event.isBase64Encoded
          ? Buffer.from(event.body, "base64")
          : Buffer.from(event.body);
        originalContentType = contentType || "application/octet-stream";
        uploadedBy = params.uploadedBy || "mobile-widget";
      }

      // Generate unique ID
      const fileId = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Store file with metadata
      await store.set(fileId, fileData, {
        metadata: {
          filename: filename,
          contentType: originalContentType,
          size: fileData.length,
          uploadedAt: new Date().toISOString(),
          uploadedBy: uploadedBy
        }
      });

      // Generate download URL
      const host = event.headers.host || "conciousnessrevolution.io";
      const downloadUrl = `https://${host}/.netlify/functions/file-upload?id=${fileId}`;

      return response(200, {
        success: true,
        fileId: fileId,
        filename: filename,
        size: fileData.length,
        url: downloadUrl,
        message: "File uploaded successfully via Netlify Blobs"
      });
    }

    // DELETE - Remove file
    if (event.httpMethod === "DELETE") {
      const fileId = params.id;

      if (!fileId) {
        return response(400, { error: "File ID required" });
      }

      await store.delete(fileId);

      return response(200, { success: true, message: "File deleted" });
    }

    return response(405, { error: "Method not allowed" });

  } catch (error) {
    console.error("File upload error:", error);
    return response(500, { error: "Upload failed", details: error.message });
  }
}
