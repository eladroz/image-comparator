export default async (request, context) => {
  try {
    // Get the URL from query parameters
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response('Missing "url" parameter', { status: 400 });
    }
    
    // Validate the URL
    let targetUrl;
    try {
      targetUrl = new URL(imageUrl);
    } catch (error) {
      return new Response('Invalid URL provided', { status: 400 });
    }
    
    // Prepare headers for the fetch request
    const fetchHeaders = new Headers();
    
    // Forward the Accept header from the original request
    const acceptHeader = request.headers.get('Accept');
    if (acceptHeader) {
      fetchHeaders.set('Accept', acceptHeader);
    }
    
    // Add a User-Agent to avoid being blocked by some servers
    fetchHeaders.set('User-Agent', 'Netlify-Edge-Image-Proxy/1.0');
    
    // Fetch the image
    const imageResponse = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: fetchHeaders,
      redirect: 'follow'
    });
    
    // Check if the fetch was successful
    if (!imageResponse.ok) {
      return new Response(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`, {
        status: imageResponse.status
      });
    }
    
    // Get the content type
    const contentType = imageResponse.headers.get('Content-Type');
    
    // Validate that it's an image
    const validImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/avif',
      'image/bmp',
      'image/ico',
      'image/x-icon'
    ];
    
    if (!contentType || !validImageTypes.some(type => contentType.toLowerCase().startsWith(type))) {
      return new Response(`Invalid content type: ${contentType || 'unknown'}. Expected an image.`, {
        status: 400
      });
    }
    
    // Create response headers, forwarding relevant headers from the original response
    const responseHeaders = new Headers();
    
    // Forward important headers
    const headersToForward = [
      'Content-Type',
      'Content-Length',
      'Cache-Control',
      'ETag',
      'Last-Modified',
      'Expires'
    ];
    
    headersToForward.forEach(header => {
      const value = imageResponse.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });
    
    // Add CORS headers if needed
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Return the image with its headers
    return new Response(imageResponse.body, {
      status: imageResponse.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response(`Error proxying image: ${error.message}`, {
      status: 500
    });
  }
};

export const config = {
  path: "/api/image-proxy"
};