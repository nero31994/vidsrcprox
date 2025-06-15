import axios from 'axios';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing movie ID. Use /proxy?id=tt5433140');
  }

  const videoUrl = `https://vidsrc.xyz/embed/movie/${id}`;

  try {
    const response = await axios.get(videoUrl);
    let html = response.data;

    // === Remove ad, tracking, anti-debug scripts ===
    html = html
      .replace(/<script[^>]*src="[^"]*(ads|histats|pop|analytics|disabledevtool)[^"]*"[^>]*><\/script>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?(DisableDevtool|Histats)[\s\S]*?<\/script>/gi, '')
      .replace(/<\/?script[^>]*>/gi, '') // remove any inline scripts (aggressive)
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // optional: remove inline styles that inject ads
      .replace(/<iframe[^>]*src="[^"]*(ads|pop)[^"]*"[^>]*><\/iframe>/gi, '');

    // === Optional: Inject safe CSS to hide UI junk ===
    html = html.replace('</head>', `
      <style>
        [id*="ads"], .ad-container, .ad, .adsbygoogle,
        #ad720, #top_buttons_parent, .histats, .popup, .floating-ads {
          display: none !important;
        }
        body {
          user-select: text !important;
          pointer-events: auto !important;
        }
      </style>
    </head>`);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).send(`Proxy error: ${error.message}`);
  }
}
