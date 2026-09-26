const cheerio = require('cheerio');

class UrlExtractor {
  /**
   * Fetch and extract readable legal text from a public web URL.
   * @param {string} urlString
   * @returns {Promise<{title: string, text: string, url: string}>}
   */
  async extractFromUrl(urlString) {
    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(urlString);
    } catch {
      throw new Error('Please provide a valid HTTP or HTTPS URL (e.g. https://example.com/terms).');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS URLs are supported.');
    }

    try {
      const response = await fetch(urlString, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LegalLens/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status} (${response.statusText}). The terms page could not be accessed directly. Please try copying and pasting the text instead.`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim() || parsedUrl.hostname + ' Terms';

      // Remove unwanted elements
      $('script, style, noscript, nav, header, footer, iframe, svg, [role="navigation"], [role="banner"], [role="complementary"]').remove();

      // Look for primary content container
      let targetElement = $('main, article, [role="main"], .terms-content, .privacy-policy, .legal-content, #content, .content').first();
      
      let text = '';
      if (targetElement.length > 0) {
        text = targetElement.text();
      } else {
        text = $('body').text();
      }

      // Clean excessive whitespace
      const cleanText = text
        .replace(/[ \t]+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();

      if (cleanText.length < 150) {
        throw new Error('The extracted page content is too short to be a valid legal policy or terms document. Please paste the terms text directly.');
      }

      return {
        title,
        text: cleanText,
        url: urlString
      };
    } catch (err) {
      if (err.name === 'TimeoutError') {
        throw new Error('Connection to the URL timed out after 12 seconds. The site may be slow or blocking automated access. Please copy and paste the terms text.');
      }
      throw err;
    }
  }
}

module.exports = new UrlExtractor();
