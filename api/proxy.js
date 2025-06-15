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

    // === Strip malicious and obfuscated scripts ===
    html = html
      // Remove external script tags with ad/tracking keywords
      .replace(/<script[^>]*src="[^"]*(ads|histats|analytics|disabledevtool|pop)[^"]*"[^>]*><\/script>/gi, '')

      // Remove inline scripts containing 'document.write' or anti-debugging
      .replace(/<script[^>]*>[\s\S]*?(document\.write|DisableDevtool|Histats|_Hasync)[\s\S]*?<\/script>/gi, '')

      // Remove all remaining <script> tags (optional, if you want to strip all JS)
      //.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

      // Remove script openers that were obfuscated
      .replace(/document\.write.*?<\/script>.*?/gi, '')

      // Remove style-based ad containers
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // === Inject safe CSS to hide leftover ad containers ===
    html = html.replace('</head>', `
      <style>
        [id*="ads"], .ad, .ad-container, .adsbygoogle, .popup, .floating-ads,
        #ad720, #top_buttons_parent, .histats, .sponsor, iframe[src*="ads"] {
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
