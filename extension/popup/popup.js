document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('page-status');
  const analyzeBtn = document.getElementById('analyze-tab-btn');
  const openAppBtn = document.getElementById('open-app-btn');

  // Query active tab
  if (chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url) {
        statusEl.textContent = `Active: ${new URL(activeTab.url).hostname}`;
      } else {
        statusEl.textContent = 'Ready to analyze legal terms.';
      }
    });
  } else {
    statusEl.textContent = 'LegalLens companion ready.';
  }

  analyzeBtn.addEventListener('click', () => {
    if (chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.url) {
          // Open LegalLens web app with the URL preloaded
          const targetUrl = `http://localhost:3000/terms?url=${encodeURIComponent(activeTab.url)}`;
          chrome.tabs.create({ url: targetUrl });
        }
      });
    } else {
      window.open('http://localhost:3000/terms', '_blank');
    }
  });

  openAppBtn.addEventListener('click', () => {
    if (chrome.tabs) {
      chrome.tabs.create({ url: 'http://localhost:3000' });
    } else {
      window.open('http://localhost:3000', '_blank');
    }
  });
});
