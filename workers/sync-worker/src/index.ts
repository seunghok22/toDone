/**
 * toDone Sync Worker — Cloudflare Worker + R2
 * 
 * 엔드포인트:
 *   POST /sync/:uuid/init    — UUID/PIN 최초 등록
 *   GET  /sync/:uuid          — R2에서 .ics 다운로드 (ETag 포함)
 *   PUT  /sync/:uuid          — R2에 .ics 업로드 (If-Match ETag 검증)
 */

interface Env {
  TODONE_BUCKET: R2Bucket;
  CORS_ORIGIN: string;
}

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Pin, If-Match',
  'Access-Control-Expose-Headers': 'ETag',
});

function jsonResponse(body: object, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.CORS_ORIGIN || '*';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const match = url.pathname.match(/^\/sync\/([a-f0-9\-]+)(\/init)?$/);
    if (!match) {
      return jsonResponse({ error: 'Not Found' }, 404, origin);
    }

    const uuid = match[1];
    const isInit = !!match[2];
    const objectKey = `${uuid}/todone.ics`;
    const metaKey = `${uuid}/.meta`;
    const pin = request.headers.get('X-User-Pin') || '';

    // ─── POST /sync/:uuid/init ───
    if (isInit && request.method === 'POST') {
      if (!pin || pin.length < 4) {
        return jsonResponse({ error: 'PIN must be at least 4 characters' }, 400, origin);
      }

      // 이미 등록된 UUID인지 확인
      const existingMeta = await env.TODONE_BUCKET.get(metaKey);
      if (existingMeta) {
        const metaText = await existingMeta.text();
        const meta = JSON.parse(metaText);
        if (meta.pin !== pin) {
          return jsonResponse({ error: 'UUID already registered with different PIN' }, 409, origin);
        }
        return jsonResponse({ message: 'Already registered', uuid }, 200, origin);
      }

      // 새 등록
      await env.TODONE_BUCKET.put(metaKey, JSON.stringify({ pin, createdAt: new Date().toISOString() }));
      return jsonResponse({ message: 'Registered', uuid }, 201, origin);
    }

    // ─── PIN 검증 (init 이외의 모든 요청) ───
    const metaObj = await env.TODONE_BUCKET.get(metaKey);
    if (!metaObj) {
      return jsonResponse({ error: 'UUID not registered. Call POST /sync/:uuid/init first.' }, 404, origin);
    }
    const metaText = await metaObj.text();
    const meta = JSON.parse(metaText);
    if (meta.pin !== pin) {
      return jsonResponse({ error: 'Unauthorized: PIN mismatch' }, 401, origin);
    }

    // ─── GET /sync/:uuid ───
    if (request.method === 'GET') {
      const object = await env.TODONE_BUCKET.get(objectKey);
      if (!object) {
        return new Response('', {
          status: 200,
          headers: {
            'Content-Type': 'text/calendar',
            'ETag': '"empty"',
            ...corsHeaders(origin),
          },
        });
      }

      const body = await object.text();
      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar',
          'ETag': `"${object.etag}"`,
          ...corsHeaders(origin),
        },
      });
    }

    // ─── PUT /sync/:uuid ───
    if (request.method === 'PUT') {
      const ifMatch = request.headers.get('If-Match');

      // Optimistic Locking: ETag가 제공된 경우 일치 여부 검증
      if (ifMatch && ifMatch !== '"empty"') {
        const existing = await env.TODONE_BUCKET.head(objectKey);
        if (existing && `"${existing.etag}"` !== ifMatch) {
          return jsonResponse(
            { error: 'Conflict: ETag mismatch. Re-download and merge.' },
            412,
            origin
          );
        }
      }

      const body = await request.text();
      const result = await env.TODONE_BUCKET.put(objectKey, body, {
        httpMetadata: { contentType: 'text/calendar' },
      });

      return new Response(null, {
        status: 204,
        headers: {
          'ETag': `"${result.etag}"`,
          ...corsHeaders(origin),
        },
      });
    }

    return jsonResponse({ error: 'Method Not Allowed' }, 405, origin);
  },
};
