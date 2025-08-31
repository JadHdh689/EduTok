// src/utils/uploadtoS3.ts

// Supports both presigned POST (url + fields) and presigned PUT (url + key)
export type PresignPost = {
  url: string;
  fields: Record<string, string>;
  key?: string;           // backend may also return key here
  method?: 'POST';
};

export type PresignPut = {
  url: string;
  key: string;
  method: 'PUT';
  headers?: Record<string, string>;
};

export async function uploadToS3(
  presign: PresignPost | PresignPut,
  file: File,
): Promise<string> {
  if ((presign as PresignPost).fields) {
    // Presigned POST
    const p = presign as PresignPost;
    const form = new FormData();
    Object.entries(p.fields).forEach(([k, v]) => form.append(k, v));
    form.append('file', file);

    const res = await fetch(p.url, { method: 'POST', body: form });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`S3 POST failed: ${res.status} ${text}`);
    }
    // Key is usually in fields.key; some backends also return p.key
    return p.key || p.fields.key;
  }

  // Presigned PUT
  const p = presign as PresignPut;
  const headers = {
    'Content-Type': file.type || 'application/octet-stream',
    ...(p.headers || {}),
  };
  const res = await fetch(p.url, { method: 'PUT', headers, body: file });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 PUT failed: ${res.status} ${text}`);
  }
  return p.key;
}
