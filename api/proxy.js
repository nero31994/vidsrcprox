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

    // Remove ad scripts and iframes
    html = html
      .replace(/<script[^>]*src="[^"]*(ads|pop|analytics)[^"]*"[^>]*><\/script>/gi, '')
      .replace(/<iframe[^>]*src="[^"]*(ads|pop)[^"]*"[^>]*><\/iframe>/gi, '')
      .replace(/<\/?script[^>]*>/gi, '');

    // Hide leftover ad containers with CSS
    html = html.replace('</head>', `
      <style>
        [id*="ads"], .ad-container, .ad, .adsbygoogle { display: none !important; }
      </style>
    </head>`);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send(`Failed to load video: ${error.message}`);
  }
                  } 
