const cheerio = require('cheerio');

class UrlContentError extends Error {
  constructor(message, code = 'CONTENT_EXTRACTION_ERROR', statusCode = 422) {
    super(message);
    this.name = 'UrlContentError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

class UrlContentService {
  /**
   * Validate, retrieve, and extract clean text from a public Terms & Conditions URL.
   * @param {string} urlString
   * @returns {Promise<{ title: string, text: string, url: string, httpStatus: number }>}
   */
  async extractTermsFromUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      throw new UrlContentError(
        'Please provide a valid website Terms & Conditions URL.',
        'VALIDATION_ERROR',
        400
      );
    }

    const trimmedUrl = urlString.trim();

    // 1. Validate URL structure
    let parsedUrl;
    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      throw new UrlContentError(
        `Invalid URL format: "${trimmedUrl}". Please provide a full HTTP or HTTPS URL (e.g. https://example.com/terms).`,
        'VALIDATION_ERROR',
        400
      );
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new UrlContentError(
        'Only public HTTP and HTTPS URLs are supported.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Block private/internal network addresses
    const host = parsedUrl.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      throw new UrlContentError(
        'Access to local or private network addresses is restricted. Please provide a public Terms URL.',
        'VALIDATION_ERROR',
        400
      );
    }

    // 2. Fetch webpage with browser-like headers and timeout
    let response;
    try {
      response = await fetch(trimmedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 LegalLens/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'TimeoutError' || fetchErr.message?.includes('timeout')) {
        throw new UrlContentError(
          `Request to "${trimmedUrl}" timed out after 15 seconds. The website may be slow, down, or blocking automated requests. Please paste the Terms text manually.`,
          'URL_FETCH_ERROR',
          504
        );
      }
      throw new UrlContentError(
        `Unable to reach URL "${trimmedUrl}": ${fetchErr.message}. Verify that the URL is accessible in your browser or paste the terms text manually.`,
        'URL_FETCH_ERROR',
        502
      );
    }

    // 3. Verify HTTP status
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new UrlContentError(
          `The website at "${trimmedUrl}" denied automated access (HTTP ${response.status}). Many platforms block direct scraping or require authentication. Please copy and paste the Terms text directly into LegalLens.`,
          'URL_FETCH_ERROR',
          422
        );
      }
      if (response.status === 404) {
        throw new UrlContentError(
          `The Terms & Conditions page at "${trimmedUrl}" was not found (HTTP 404). Please check the link or provide the updated URL.`,
          'URL_FETCH_ERROR',
          404
        );
      }
      throw new UrlContentError(
        `The web server returned HTTP status ${response.status} (${response.statusText}) when attempting to fetch "${trimmedUrl}". Try another public URL or paste the text manually.`,
        'URL_FETCH_ERROR',
        502
      );
    }

    // 4. Retrieve HTML and parse
    let rawHtml;
    try {
      rawHtml = await response.text();
    } catch (readErr) {
      throw new UrlContentError(
        `Failed to read response body from "${trimmedUrl}": ${readErr.message}`,
        'CONTENT_EXTRACTION_ERROR',
        502
      );
    }

    if (!rawHtml || rawHtml.trim().length === 0) {
      throw new UrlContentError(
        `The server returned an empty page for "${trimmedUrl}". The page may require JavaScript or authentication. Try another public URL or paste the text manually.`,
        'CONTENT_EXTRACTION_ERROR',
        422
      );
    }

    const $ = cheerio.load(rawHtml);

    // Extract title
    const pageTitle = (
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      `${parsedUrl.hostname} Terms of Service`
    ).replace(/\s+/g, ' ').trim();

    // 5. Clean unrelated DOM elements
    $(
      'script, style, noscript, nav, header, footer, iframe, svg, form, ' +
      'aside, button, select, input, textarea, ' +
      '[role="navigation"], [role="banner"], [role="complementary"], [role="dialog"], ' +
      '.cookie-banner, #cookie-banner, .advertisement, .ad, .social-share'
    ).remove();

    // Insert newlines after block elements to preserve natural text boundaries
    $('p, h1, h2, h3, h4, h5, h6, li, tr, dt, dd, blockquote, div.clause, section, article').after('\n\n');
    $('br').replaceWith('\n');

    // 6. Look for substantive content container or fallback to body
    const candidateSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.terms-content',
      '.terms-of-service',
      '.legal-content',
      '.privacy-policy',
      '#terms-content',
      '#legal-content',
      '.entry-content',
      '.post-content',
      '#content',
      '.content'
    ];

    let extractedText = '';

    for (const selector of candidateSelectors) {
      const el = $(selector).first();
      if (el.length > 0) {
        const text = el.text().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
        // If container has at least 400 characters, it's a solid candidate
        if (text.length >= 400) {
          extractedText = text;
          break;
        }
      }
    }

    // Fall back to entire cleaned body if no container met the threshold
    if (!extractedText || extractedText.length < 400) {
      extractedText = $('body').text().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    }

    // 7. Verify minimum length
    const MINIMUM_LENGTH = 150;
    if (!extractedText || extractedText.length < MINIMUM_LENGTH) {
      throw new UrlContentError(
        'Unable to retrieve meaningful Terms & Conditions content from this URL.\n\n' +
        'The website may block automated requests, require JavaScript, require authentication, or the URL may not contain accessible Terms & Conditions text.\n\n' +
        'Try another public Terms & Conditions URL or paste the text manually.',
        'CONTENT_EXTRACTION_ERROR',
        422
      );
    }

    // 8. Heuristic verification of legal/terms relevance
    const legalKeywords = [
      'terms', 'condition', 'agreement', 'service', 'user', 'privacy',
      'liability', 'termination', 'dispute', 'contract', 'policy', 'rights',
      'cancellation', 'refund', 'warranty', 'governing', 'obligation', 'license'
    ];
    const lowerText = extractedText.toLowerCase();
    const keywordMatches = legalKeywords.filter(kw => lowerText.includes(kw));

    if (keywordMatches.length === 0 && extractedText.length < 500) {
      throw new UrlContentError(
        'The extracted page content does not appear to contain standard Terms & Conditions or legal policy clauses.\n\n' +
        'Please verify that the URL points directly to a Terms of Service, User Agreement, or Privacy Policy, or paste the text manually.',
        'CONTENT_EXTRACTION_ERROR',
        422
      );
    }

    // 9. Development Debugging Logs (Requirement 12)
    console.log('[LegalLens] URL:', trimmedUrl);
    console.log('[LegalLens] HTTP status:', response.status);
    console.log('[LegalLens] Page title:', pageTitle);
    console.log('[LegalLens] Extracted text length:', extractedText.length);
    console.log('[LegalLens] Extracted preview:', `"${extractedText.slice(0, 300).replace(/\s+/g, ' ')}..."`);

    return {
      title: pageTitle,
      text: extractedText,
      url: trimmedUrl,
      httpStatus: response.status
    };
  }
}

const urlContentService = new UrlContentService();
urlContentService.UrlContentError = UrlContentError;

module.exports = urlContentService;
