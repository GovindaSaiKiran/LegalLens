const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const config = require('../config');

exports.getOverview = (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const recent = db.getRecentAnalyses(userId, 20);
    const saved = db.getSavedReports(userId);

    // Compute stats
    const stats = {
      totalAnalyses: recent.length,
      savedReportsCount: saved.length,
      termsCount: recent.filter(r => r.type === 'terms').length,
      documentsCount: recent.filter(r => r.type === 'document').length,
      ragCount: recent.filter(r => r.type === 'rag').length,
      comparisonCount: recent.filter(r => r.type === 'comparison').length
    };

    res.json({
      recent,
      saved,
      stats
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleSave = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const updated = db.toggleSaveReport(id, userId);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    res.json({
      id,
      is_saved: updated.is_saved,
      message: updated.is_saved ? 'Report saved to your library.' : 'Report removed from saved library.'
    });
  } catch (err) {
    next(err);
  }
};

exports.getDemoDocuments = (req, res, next) => {
  try {
    const demos = [
      {
        id: 'saas-terms',
        title: 'CloudScale Pro Terms of Service',
        type: 'Terms & Conditions',
        description: 'Commercial SaaS terms with automatic renewal, strict refund limits, user content ML licensing, and mandatory arbitration.',
        filename: 'saas_terms_and_conditions.txt'
      },
      {
        id: 'privacy-policy',
        title: 'PulseHealth Mobile App Privacy Policy',
        type: 'Privacy Policy',
        description: 'Health tech app policy collecting sensitive biometric and telemetry data, with DPDP Act 2023 compliance terms.',
        filename: 'privacy_policy.txt'
      },
      {
        id: 'rental-agreement',
        title: 'Residential Tenancy Agreement (Hyderabad)',
        type: 'Tenancy / Lease',
        description: '11-month lease agreement with security deposit clauses, maintenance obligations, lock-in period, and eviction terms.',
        filename: 'residential_rental_agreement.txt'
      },
      {
        id: 'employment-agreement',
        title: 'Senior Software Engineer Employment Agreement',
        type: 'Employment Contract',
        description: 'Tech employment contract featuring a 90-day notice period, comprehensive IP assignment, and 12-month post-employment non-compete clause.',
        filename: 'employment_agreement.txt'
      }
    ];

    res.json({ demos });
  } catch (err) {
    next(err);
  }
};
