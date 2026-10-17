// Next.js API Route Proxy — /api/proxy/[...path]
// Forwards ALL requests to the backend server with retry logic.
// This eliminates CORS issues on mobile — requests become same-origin.

export const runtime = 'nodejs'; // Use Node.js runtime (not Edge) for better timeout support
export const maxDuration = 30;   // 30 second max (Vercel hobby allows up to 60s)

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://maplead-server.vercel.app/api';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
};

export async function GET(request, { params }) {
  return proxyRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return proxyRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return proxyRequest(request, params, 'PUT');
}

export async function PATCH(request, { params }) {
  return proxyRequest(request, params, 'PATCH');
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params, 'DELETE');
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

async function fetchWithRetry(targetUrl, fetchOptions, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per attempt

      const response = await fetch(targetUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        // Wait before retry: 500ms, 1500ms
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }
  throw lastError;
}

async function proxyRequest(request, params, method) {
  try {
    const pathSegments = await params;
    const path = Array.isArray(pathSegments?.path)
      ? pathSegments.path.join('/')
      : (pathSegments?.path || '');
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/${path}${url.search}`;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const fetchOptions = { method, headers };

    if (method !== 'GET' && method !== 'DELETE') {
      try {
        const body = await request.text();
        if (body) fetchOptions.body = body;
      } catch { /* ignore body read errors */ }
    }

    const response = await fetchWithRetry(targetUrl, fetchOptions, 3);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    console.error('[Proxy Error]', err?.message || err);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Proxy error: ${err?.message || 'Unknown error'}. Please try again.`,
        proxyError: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}
