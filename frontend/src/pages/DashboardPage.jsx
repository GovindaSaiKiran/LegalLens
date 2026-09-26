import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  HelpCircle, 
  Upload, 
  GitCompare, 
  Bookmark, 
  Clock, 
  ArrowRight, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  FolderLock,
  Layers,
  CheckCircle2,
  Scale,
  BookOpen
} from 'lucide-react';
import { getDashboardOverview, toggleSaveReport, deleteDocument, analyzeTermsDemo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState({ recent: [], saved: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'terms' | 'document' | 'comparison' | 'rag'
  const [loadingDemoId, setLoadingDemoId] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await getDashboardOverview();
      setData(res?.data || { recent: [], saved: [], stats: {} });
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleSave = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await toggleSaveReport(id);
      const isSaved = res?.data?.is_saved;
      setData(prev => {
        const updateList = (list) =>
          list.map(item => item.id === id ? { ...item, is_saved: isSaved } : item);
        const updatedRecent = updateList(prev.recent || []);
        let updatedSaved = prev.saved || [];
        if (isSaved) {
          const target = updatedRecent.find(i => i.id === id);
          if (target && !updatedSaved.some(i => i.id === id)) {
            updatedSaved = [target, ...updatedSaved];
          }
        } else {
          updatedSaved = updatedSaved.filter(i => i.id !== id);
        }
        return {
          ...prev,
          recent: updatedRecent,
          saved: updatedSaved,
          stats: {
            ...prev.stats,
            savedReportsCount: updatedSaved.length
          }
        };
      });
    } catch (err) {
      console.error('Error updating save status:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(t('dash.confirmDelete', 'Delete this analysis from your history?'))) {
      try {
        await deleteDocument(id);
        setData(prev => ({
          ...prev,
          recent: (prev.recent || []).filter(item => item.id !== id),
          saved: (prev.saved || []).filter(item => item.id !== id),
          stats: {
            ...prev.stats,
            totalAnalyses: Math.max(0, (prev.stats?.totalAnalyses || 1) - 1)
          }
        }));
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  const handleQuickDemo = async (demoId) => {
    setLoadingDemoId(demoId);
    try {
      const res = await analyzeTermsDemo(demoId);
      if (res?.data?.id) {
        navigate(`/analysis/${res.data.id}`);
      }
    } catch (err) {
      console.error('Failed to load demo:', err);
    } finally {
      setLoadingDemoId(null);
    }
  };

  const quickActions = [
    {
      to: '/terms',
      label: t('nav.terms', 'Analyze Terms'),
      desc: t('terms.badge', 'Terms & Privacy extraction'),
      icon: FileSearch,
      color: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      to: '/legal-assistant',
      label: t('nav.assistant', 'Legal Assistant'),
      desc: t('assistant.sourceBackedFacts', 'RAG statutory awareness'),
      icon: HelpCircle,
      color: 'bg-purple-100 text-purple-900 border-purple-300'
    },
    {
      to: '/upload',
      label: t('nav.upload', 'Upload Document'),
      desc: t('upload.formats', 'PDF, DOCX, TXT OCR'),
      icon: Upload,
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      to: '/compare',
      label: t('nav.compare', 'Compare Docs'),
      desc: t('compare.badge', 'Semantic clause diff'),
      icon: GitCompare,
      color: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    {
      to: '/glossary',
      label: t('nav.glossary', 'Legal Glossary'),
      desc: t('glossary.badge', 'Decode jargon & Latin terms'),
      icon: BookOpen,
      color: 'bg-rose-100 text-rose-900 border-rose-300'
    }
  ];

  const getTypeBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'terms':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'document':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'comparison':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'rag':
      case 'assistant':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Filter and search active tab list
  const activeList = useMemo(() => {
    const list = activeTab === 'recent' ? (data.recent || []) : (data.saved || []);
    return list.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || item.type?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [data, activeTab, searchQuery, filterType]);

  const stats = data.stats || {};
  const totalCount = stats.totalAnalyses ?? (data.recent?.length || 0);
  const savedCount = stats.savedReportsCount ?? (data.saved?.length || 0);
  const termsCount = stats.termsCount ?? (data.recent || []).filter(r => r.type === 'terms').length;
  const docsCount = (stats.documentsCount || 0) + (stats.comparisonCount || 0) + (stats.ragCount || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 min-w-0 overflow-x-hidden pb-32 sm:pb-36">
      {/* 1. Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              {t('dash.workspace', 'Personal Workspace')}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 break-words">
            {user?.name ? `${t('dash.welcome', 'Welcome back')}, ${user.name}` : t('dash.guestWelcome', 'Legal Awareness Dashboard')}
          </h1>
          <p className="text-slate-600 font-medium text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl">
            {t('dash.subtitle', 'Track and reopen your recent terms analyses, statutory queries, and contract reports.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => loadOverview(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition flex items-center gap-1.5 text-xs font-bold cursor-pointer disabled:opacity-60"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <Link
            to="/terms"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 font-bold uppercase text-xs sm:text-sm shadow-2xs transition flex items-center gap-2 cursor-pointer"
          >
            <FileSearch className="w-4 h-4 stroke-[2.5]" />
            <span>{t('dash.newAnalysis', 'New Analysis')}</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 min-w-0">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block truncate">
              {t('dash.totalAnalyses', 'Total Analyses')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {loading ? '...' : totalCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
            <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block truncate">
              {t('dash.savedReports', 'Saved in Library')}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {loading ? '...' : savedCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Bookmark className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block truncate">
              Terms & Policies
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {loading ? '...' : termsCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center shrink-0 shadow-2xs">
            <FileSearch className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block truncate">
              Uploads & Queries
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {loading ? '...' : docsCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 3. Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 min-w-0">
        {quickActions.map((qa, i) => {
          const Icon = qa.icon;
          return (
            <Link
              key={i}
              to={qa.to}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs hover:shadow-sm transition-all flex items-start gap-4 group min-w-0"
            >
              <div className={`p-3 rounded-xl border shadow-2xs ${qa.color} shrink-0`}>
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-amber-600 transition-colors truncate">
                  {qa.label}
                </h4>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {qa.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4. Reports Library & Recent Analyses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {/* Tab Headers & Search Filter Controls */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${
                activeTab === 'recent' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
              }`}
            >
              {t('dash.recentTab', 'Recent Analyses')} ({data.recent?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition border cursor-pointer ${
                activeTab === 'saved' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-2xs'
              }`}
            >
              {t('dash.savedTab', 'Saved Reports')} ({data.saved?.length || 0})
            </button>
          </div>

          {/* Search & Type Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap min-w-0">
            <div className="relative flex-1 sm:w-56 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search analyses..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="terms">Terms</option>
              <option value="document">Document</option>
              <option value="comparison">Comparison</option>
              <option value="rag">Assistant</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-slate-100 min-w-0">
          {loading ? (
            /* Loading Skeleton State */
            <div className="p-6 space-y-4 min-w-0">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-8 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : activeList.length > 0 ? (
            activeList.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/analysis/${item.id}`)}
                className="p-4 sm:p-5 hover:bg-slate-50/90 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group min-w-0"
              >
                {/* Left: Icon & Text content (flex-1 min-w-0 ensures truncation works properly) */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 group-hover:bg-amber-100 text-slate-800 transition shrink-0 mt-0.5 shadow-2xs">
                    <FileText className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-2xs ${getTypeBadgeStyle(item.type)}`}>
                        {item.type || 'Report'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h4>
                    {item.source_url && (
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{item.source_url}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions Container (shrink-0 & non-overlapping) */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={(e) => handleToggleSave(item.id, e)}
                    title={item.is_saved ? t('dash.unsave', 'Saved') : t('dash.save', 'Save to library')}
                    className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition shadow-2xs cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 stroke-[2.2] ${item.is_saved ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    title={t('dash.delete', 'Delete analysis')}
                    className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>

                  <div className="p-2 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-12 sm:py-16 px-4 space-y-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center shadow-2xs">
                <FileText className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  {searchQuery || filterType !== 'all' 
                    ? 'No matching analyses found' 
                    : activeTab === 'saved' 
                      ? 'No saved reports in library' 
                      : t('dash.noReports', 'No analyses found yet')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search terms or filter selection.'
                    : t('dash.noReportsDesc', 'Analyze your first terms agreement, contract, or legal question to see your history here.')}
                </p>
              </div>

              {/* Instant sample generation buttons */}
              {(!searchQuery && filterType === 'all') && (
                <div className="pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                    {t('dash.quickDemos', 'Try Instant Demos:')}
                  </span>
                  <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                    <button
                      onClick={() => handleQuickDemo('saas-terms')}
                      disabled={!!loadingDemoId}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {loadingDemoId === 'saas-terms' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>Analyzing SaaS...</span>
                        </>
                      ) : (
                        <span>{t('compare.sampleTerms', 'CloudScale SaaS Terms')}</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleQuickDemo('rental-agreement')}
                      disabled={!!loadingDemoId}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {loadingDemoId === 'rental-agreement' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>Analyzing Lease...</span>
                        </>
                      ) : (
                        <span>{t('compare.sampleLease', 'Tenancy Lease')}</span>
                      )}
                    </button>
                    <button
                      onClick={() => handleQuickDemo('employment-agreement')}
                      disabled={!!loadingDemoId}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {loadingDemoId === 'employment-agreement' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>Analyzing Contract...</span>
                        </>
                      ) : (
                        <span>Employment Agreement</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Legal Awareness Disclaimer Banner */}
      <DisclaimerBanner />
    </div>
  );
}
