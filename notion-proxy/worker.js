// Cloudflare Worker - Notion API Proxy
// Students use the tool without seeing the Notion token

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const url = new URL(request.url);
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Only allow POST requests to /api/notion
    if (url.pathname !== '/api/notion' || request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }

    // Get target URL from request body
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

    // Forward request to Notion with token
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
