import { describe, it, expect } from 'vitest';
import { simplifyLegalText, generateEli5Breakdown } from './utils/simplifier';

describe('Legal Document Simplifier (ELI5 Utility)', () => {
  it('translates complex legal jargon into everyday plain English', () => {
    const legalText = 'The user shall indemnify the provider against any liability and submit to mandatory arbitration in this jurisdiction.';
    const simplified = simplifyLegalText(legalText);

    expect(simplified).toContain('protect and pay for any legal losses');
    expect(simplified).toContain('legal responsibility for damages');
    expect(simplified).toContain('private dispute judge instead of public court');
    expect(simplified).toContain('which official court has legal power');
  });

  it('safely handles empty or null input strings without throwing errors', () => {
    expect(simplifyLegalText('')).toBe('');
    expect(simplifyLegalText(null)).toBe('');
    expect(simplifyLegalText(undefined)).toBe('');
  });

  it('generates structured ELI5 breakdown for legal analysis', () => {
    const mockAnalysis = {
      summary: 'This contract contains auto-renewal obligations and limitation of liability provisions.',
      important_points: [
        {
          title: 'Subscription Auto-Renewal',
          category: 'Billing',
          finding: 'Charges renew automatically without advance confirmation.'
        }
      ],
      obligations: [
        { party: 'User', obligation: 'Pay invoices forthwith and indemnify the company.' }
      ]
    };

    const breakdown = generateEli5Breakdown(mockAnalysis);
    expect(breakdown).toBeDefined();
    expect(breakdown.bottomLine).toBeDefined();
    expect(breakdown.simpleRules.length).toBeGreaterThan(0);
    expect(breakdown.simpleRules[0]).toContain('User:');
    expect(breakdown.simpleCatches.length).toBeGreaterThan(0);
  });

  it('returns null when analysis object is missing or invalid', () => {
    expect(generateEli5Breakdown(null)).toBeNull();
    expect(generateEli5Breakdown(undefined)).toBeNull();
  });
});
