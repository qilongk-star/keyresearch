// Cloudflare Worker - Notion API + PDF Proxy
// Students use the tool without seeing the Notion token

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
        }
      });
    }

    // ── PDF Proxy ─────────────────────────────────────────────────────────────
    // GET /pdf?url=...  →  download PDF from file.notion.so via Worker
    if (url.pathname === '/pdf' && request.method === 'GET') {
      const pdfUrl = url.searchParams.get('url');
      if (!pdfUrl || !pdfUrl.includes('file.notion.so')) {
        return new Response('Invalid PDF URL', { status: 400 });
      }
      try {
        const resp = await fetch(pdfUrl);
        if (!resp.ok) return new Response('Upstream fetch failed', { status: 502 });
        const data = await resp.arrayBuffer();
        return new Response(data, {
          headers: {
            'Content-Type': 'application/pdf',
            'Access-Control-Allow-Origin': '*',
            'Content-Length': data.byteLength,
          }
        });
      } catch (e) {
        return new Response('Fetch error: ' + e.message, { status: 502 });
      }
    }

    // ── Notion API ───────────────────────────────────────────────────────────
    // POST /api/notion  →  forward to Notion API with token
    if (url.pathname !== '/api/notion' || request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    const targetUrl = body.url;
    if (!targetUrl || !targetUrl.startsWith('https://api.notion.com/')) {
      return new Response(JSON.stringify({ error: 'Invalid target URL' }), { status: 400 });
    }

    const notionResponse = await fetch(targetUrl, {
      method: body.method || 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.NOTION_TOKEN,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: body.body ? JSON.stringify(body.body) : undefined,
    });

    const data = await notionResponse.json();

    return new Response(JSON.stringify(data), {
      status: notionResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
