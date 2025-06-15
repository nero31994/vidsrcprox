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

    html = html
      .replace(/<script[^>]*src="[^"]*(ads|histats|analytics|disabledevtool|pop)[^"]*"[^>]*><\/script>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?(document\.write|DisableDevtool|Histats|_Hasync)[\s\S]*?<\/script>/gi, '')
      .replace(/document\.write\(.*?<\/script>.*?\)/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

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
