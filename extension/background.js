/**
 * LegalLens Browser Companion - Background Service Worker
 * Handles extension life-cycle and tab messaging.
 * Securely communicates with the LegalLens backend API without exposing any API keys in client-side code.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[LegalLens Extension] Installed successfully.');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeUrl') {
    // Forward URL to LegalLens Backend API (centralized Groq engine)
    fetch('http://localhost:5000/api/url/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: request.url })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true; // Keep message port open for async response
  }
});
