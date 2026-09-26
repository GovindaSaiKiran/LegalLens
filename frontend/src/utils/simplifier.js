/**
 * Plain-Language & ELI5 Simplifier Utility for LegalLens
 * Translates complex legal terminology and structured analysis into 5th-grade everyday English.
 */

export function simplifyLegalText(text) {
  if (!text) return '';
  return text
    .replace(/\bheretofore\b/gi, 'before now')
    .replace(/\bherein\b/gi, 'in this document')
    .replace(/\bhereinafter\b/gi, 'from now on called')
    .replace(/\bwherefore\b/gi, 'therefore')
    .replace(/\bforthwith\b/gi, 'immediately')
    .replace(/\bindemnify\b/gi, 'protect and pay for any legal losses')
    .replace(/\bindemnification\b/gi, 'paying for legal damages or losses')
    .replace(/\bliable\b/gi, 'legally responsible')
    .replace(/\bliability\b/gi, 'legal responsibility for damages')
    .replace(/\bseverability\b/gi, 'if one rule is invalid, the rest still apply')
    .replace(/\bjurisdiction\b/gi, 'which official court has legal power')
    .replace(/\barbitration\b/gi, 'private dispute judge instead of public court')
    .replace(/\bliquidated damages\b/gi, 'pre-agreed penalty fee')
    .replace(/\bforce majeure\b/gi, 'unavoidable disaster or emergency')
    .replace(/\bwithout prejudice\b/gi, 'without giving up any future legal rights')
    .replace(/\bmutatis mutandis\b/gi, 'with necessary small changes');
}

export function generateEli5Breakdown(analysis) {
  if (!analysis) return null;

  const rawSummary = analysis.summary || '';
  const importantPoints = analysis.important_points || [];
  const obligations = analysis.obligations || [];
  const deadlines = analysis.deadlines || [];

  // 1. One-sentence core bottom line
  let bottomLine = simplifyLegalText(rawSummary.split('.')[0] || rawSummary);
  if (!bottomLine.endsWith('.')) bottomLine += '.';

  // 2. Clear simple bullet points for everyday users
  const simpleRules = [];
  if (obligations.length > 0) {
    obligations.slice(0, 3).forEach(o => {
      simpleRules.push(`${o.party || 'User'}: ${simplifyLegalText(o.obligation)}`);
    });
  } else {
    simpleRules.push("You must follow all acceptable usage rules and community guidelines.");
    simpleRules.push("You must keep your account login and payment details secure.");
    simpleRules.push("You agree that the company can update its features and policies.");
  }

  // 3. Main catches / traps to watch out for
  const simpleCatches = [];
  if (importantPoints.length > 0) {
    importantPoints.slice(0, 3).forEach(p => {
      simpleCatches.push(`⚠️ ${p.title || p.category}: ${simplifyLegalText(p.finding || p.relevance || '')}`);
    });
  } else {
    simpleCatches.push("⚠️ Auto-Renewal: Your subscription might renew automatically unless you cancel in advance.");
    simpleCatches.push("⚠️ Arbitration: You might give up your right to sue in regular public court.");
    simpleCatches.push("⚠️ Limited Liability: If the service goes down, the company is not responsible for big financial losses.");
  }

  return {
    bottomLine,
    simpleRules,
    simpleCatches,
    fullSimplifiedSummary: simplifyLegalText(rawSummary)
  };
}
