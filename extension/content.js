/**
 * LegalLens Content Script
 * Scans webpage for legal consent checkboxes and policy links.
 * Injects non-intrusive 'Before You Agree' awareness overlay.
 * NOTE: Never automatically accepts, rejects, or clicks form buttons.
 */

(function () {
  const CONSENT_REGEX = /(terms\s*(&|and)?\s*conditions|terms\s*of\s*(service|use)|privacy\s*policy|user\s*agreement|cookie\s*policy)/i;
  const AGREE_REGEX = /(i\s*(agree|accept)|by\s*(clicking|continuing|signing\s*up)|read\s*and\s*agree)/i;

  let hasInjected = false;

  function scanForConsentElements() {
    if (hasInjected) return;

    // Check all checkboxes on the page
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      // Check parent label or surrounding text
      let container = cb.closest('label') || cb.parentElement;
      if (!container) return;

      const text = container.textContent || '';
      if (CONSENT_REGEX.test(text) || (AGREE_REGEX.test(text) && text.length < 250)) {
        // Find associated link
        const link = container.querySelector('a') || document.querySelector('a[href*="terms"], a[href*="privacy"]');
        const policyUrl = link ? link.href : window.location.href;

        injectLegalLensBadge(container, policyUrl);
        hasInjected = true;
      }
    });

    // Also check standalone links in footer/forms if no checkbox matched
    if (!hasInjected) {
      const legalLinks = Array.from(document.querySelectorAll('a')).filter(a => 
        CONSENT_REGEX.test(a.textContent || '') && a.href && a.href.startsWith('http')
      );
      if (legalLinks.length > 0) {
        // Place badge near first found terms link
        injectLegalLensBadge(legalLinks[0].parentElement || legalLinks[0], legalLinks[0].href);
        hasInjected = true;
      }
    }
  }

  function injectLegalLensBadge(targetElement, targetUrl) {
    if (document.getElementById('legallens-badge-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'legallens-badge-wrapper';
    wrapper.className = 'legallens-badge-container';

    wrapper.innerHTML = `
      <div class="legallens-pill" id="legallens-toggle-btn" title="LegalLens: Review key terms before agreeing">
        <span class="legallens-icon">⚖️</span>
        <span class="legallens-pill-text">LegalLens: Before you agree</span>
      </div>

      <div class="legallens-overlay-popup" id="legallens-popup" style="display: none;">
        <div class="legallens-header">
          <div class="legallens-title-group">
            <span class="legallens-logo">⚖️ LegalLens</span>
            <span class="legallens-subtitle">Before you agree</span>
          </div>
          <button class="legallens-close-btn" id="legallens-close-btn">×</button>
        </div>

        <div class="legallens-body">
          <p class="legallens-intro">Common provisions identified in standard service terms:</p>
          
          <ul class="legallens-list">
            <li>
              <strong>Data usage:</strong> Usage metrics, IP address, and telemetry may be processed and shared with infrastructure vendors.
            </li>
            <li>
              <strong>Automatic renewal:</strong> Subscriptions typically renew automatically unless cancelled prior to the cycle cutoff.
            </li>
            <li>
              <strong>Cancellation & refunds:</strong> Prior payments are often non-refundable once the billing window commences.
            </li>
            <li>
              <strong>Account termination:</strong> Service access may be suspended or modified under specified operational conditions.
            </li>
            <li>
              <strong>Dispute resolution:</strong> Controversies may be subject to individual binding arbitration rather than civil court lawsuits.
            </li>
          </ul>

          <div class="legallens-footer">
            <span class="legallens-safety-note">You remain in control • No automatic decisions</span>
            <a href="http://localhost:3000/terms" target="_blank" class="legallens-app-link">
              Open Full Analysis in LegalLens ↗
            </a>
          </div>
        </div>
      </div>
    `;

    // Append adjacent to target
    targetElement.appendChild(wrapper);

    // Add click listeners
    const toggleBtn = wrapper.querySelector('#legallens-toggle-btn');
    const popup = wrapper.querySelector('#legallens-popup');
    const closeBtn = wrapper.querySelector('#legallens-close-btn');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      popup.style.display = 'none';
    });
  }

  // Scan immediately and after DOM changes
  scanForConsentElements();
  setTimeout(scanForConsentElements, 1000);
  setTimeout(scanForConsentElements, 3000);
})();
