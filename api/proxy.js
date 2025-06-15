import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing movie ID. Use /proxy?id=tt5433140');
  }

  const videoUrl = `https://vidsrc.xyz/embed/movie/${id}`;

  try {
    const response = await axios.get(videoUrl);
    const $ = cheerio.load(response.data);

    // Find the first iframe (the video player)
    const iframe = $('iframe').first();
    const iframeSrc = iframe.attr('src');

    if (!iframeSrc) {
      return res.status(404).send('Video iframe not found');
    }

    // Clean HTML output with only the iframe embedded
    const cleanedHtml = \`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clean Video Player</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            background: #000;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="\${iframeSrc}" allowfullscreen></iframe>
      </body>
      </html>
    \`;

    res.setHeader('Content-Type', 'text/html');
    res.send(cleanedHtml);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).send('Proxy error: ' + error.message);
  }
}
