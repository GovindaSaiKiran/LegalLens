const db = require('../src/config/database');

describe('Database Architecture & Non-Blocking Operations', () => {
  beforeAll(() => {
    db.initializeDatabase();
  });

  it('creates and finds users by email with proper data isolation', async () => {
    const testUser = {
      id: 'test-user-uuid-1',
      name: 'Legal Auditor',
      email: 'auditor@legallens.test',
      password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      created_at: new Date().toISOString()
    };

    // Test async non-blocking insertion
    const created = await db.createUserAsync(testUser);
    expect(created.id).toBe(testUser.id);

    // Test async lookup
    const found = await db.findUserByEmailAsync('auditor@legallens.test');
    expect(found).toBeDefined();
    expect(found.name).toBe('Legal Auditor');
    expect(found.email).toBe('auditor@legallens.test');
  });

  it('stores and retrieves document analyses non-blockingly', async () => {
    const testAnalysis = {
      id: 'test-analysis-uuid-1',
      user_id: 'test-user-uuid-1',
      type: 'terms',
      title: 'Cloud Service SLA',
      source_type: 'paste',
      source_url: null,
      raw_text: 'Sample SLA terms with liability disclaimers.',
      structured_result: {
        summary: 'Cloud SLA overview',
        important_points: []
      },
      is_saved: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const saved = await db.createAnalysisAsync(testAnalysis);
    expect(saved.id).toBe(testAnalysis.id);

    const retrieved = await db.getAnalysisByIdAsync('test-analysis-uuid-1');
    expect(retrieved).toBeDefined();
    expect(retrieved.title).toBe('Cloud Service SLA');
  });

  it('toggles saved status for generated legal reports', async () => {
    const toggleResult = await db.toggleSaveReportAsync('test-analysis-uuid-1');
    expect(toggleResult).toBeDefined();
    expect(typeof toggleResult.is_saved).toBe('boolean');
  });
});
