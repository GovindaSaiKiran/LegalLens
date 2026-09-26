class JurisdictionService {
  constructor() {
    this.jurisdictions = {
      india: {
        id: 'india',
        name: 'India',
        defaultState: 'Telangana',
        states: [
          'Telangana',
          'Karnataka',
          'Maharashtra',
          'Delhi',
          'Tamil Nadu',
          'Uttar Pradesh',
          'West Bengal',
          'Gujarat',
          'Haryana',
          'Kerala'
        ],
        categories: [
          { id: 'consumer', label: 'Consumer Disputes & E-Commerce', description: 'Defective goods, refund issues, unfair trade practices, warranty violations' },
          { id: 'employment', label: 'Employment & Labor', description: 'Notice periods, non-compete clauses, gratuity, wrongful termination, unpaid salary' },
          { id: 'rental', label: 'Rental & Housing', description: 'Tenancy agreements, security deposit withholding, maintenance, eviction notice' },
          { id: 'contracts', label: 'General Contracts', description: 'Breach of contract, validity, penalty clauses, vendor agreements' },
          { id: 'cyber', label: 'Cyber & Data Protection', description: 'Privacy policies, personal data breach, DPDP compliance, identity theft' },
          { id: 'family', label: 'Family & Succession', description: 'Maintenance, domestic agreements, succession, property rights' },
          { id: 'education', label: 'Education & Institutional', description: 'College fee refunds, admission disputes, student rights' },
          { id: 'other', label: 'Other / General Legal', description: 'General legal awareness inquiries' }
        ]
      }
    };
  }

  getJurisdiction(id = 'india') {
    return this.jurisdictions[id.toLowerCase()] || this.jurisdictions['india'];
  }

  getAllJurisdictions() {
    return Object.values(this.jurisdictions);
  }

  detectCategory(text) {
    const t = text.toLowerCase();
    if (/landlord|tenant|deposit|rent|eviction|lease|flat|housing|broker/i.test(t)) return 'rental';
    if (/consumer|refund|seller|amazon|flipkart|defective|warranty|delivery|courier/i.test(t)) return 'consumer';
    if (/salary|employment|employer|boss|resignation|notice period|gratuity|job|pf|provident|firing|hike/i.test(t)) return 'employment';
    if (/data|privacy|hacked|scam|phishing|otp|cyber|leaked|dpdp|aadhaar/i.test(t)) return 'cyber';
    if (/contract|clause|nda|agreement|penalty|liquidated damages/i.test(t)) return 'contracts';
    if (/divorce|marriage|child custody|maintenance|alimony/i.test(t)) return 'family';
    if (/college|school|fee|refund.*admission|university|degree/i.test(t)) return 'education';
    return 'other';
  }
}

module.exports = new JurisdictionService();
