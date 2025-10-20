import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PenTool, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Motion, MotionStatus, MOTION_STATUS_LABELS, MOTION_STATUS_COLORS } from '../types/motion';
import { Survey, SurveyStatus, SURVEY_STATUS_LABELS, SURVEY_STATUS_COLORS } from '../types/survey';
import { formatDate, calculateProgress } from '../lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-motions' | 'signatures' | 'surveys' | 'analytics'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [myMotions, setMyMotions] = useState<Motion[]>([]);
  const [mySignatures, setMySignatures] = useState<any[]>([]);
  const [mySurveys, setMySurveys] = useState<Survey[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [motionsRes, signaturesRes, surveysRes, votesRes] = await Promise.all([
        api.get('/api/motions/my/motions'),
        api.get('/api/motions/my/signatures'),
        api.get('/api/surveys/my/surveys'),
        api.get('/api/surveys/my/votes'),
      ]);
      
      setMyMotions(motionsRes.data.data.motions);
      setMySignatures(signaturesRes.data.data.signatures);
      setMySurveys(surveysRes.data.data.surveys || []);
      setMyVotes(votesRes.data.data.votes || []);
      
      // Calculate stats
      setStats({
        totalMotions: motionsRes.data.data.motions.length,
        activeMotions: motionsRes.data.data.motions.filter((m: Motion) => 
          m.status === MotionStatus.COLLECTING || m.status === MotionStatus.DRAFT
        ).length,
        totalSignatures: signaturesRes.data.data.signatures.length,
        completedMotions: motionsRes.data.data.motions.filter((m: Motion) => 
          m.status === MotionStatus.ACCEPTED || m.status === MotionStatus.APPROVED
        ).length,
        totalSurveys: (surveysRes.data.data.surveys || []).length,
        totalVotes: (votesRes.data.data.votes || []).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStaff = user && ['admin', 'bgst', 'bantrk', 'buvo'].includes(user.role);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Lädt...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with User Info */}
      <div className="bg-gradient-to-r from-oedp-orange to-orange-600 text-white rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Willkommen, {user?.firstName}!</h1>
            <p className="text-white/90">
              {user?.role === 'admin' && '🔧 Administrator'}
              {user?.role === 'bgst' && '📋 Bundesgeschäftsstelle'}
              {user?.role === 'bantrk' && '📝 Antragskommission'}
              {user?.role === 'member' && '👤 Mitglied'}
              {user?.landesverband && ` • ${user.landesverband}`}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/surveys/create" className="btn bg-white text-oedp-orange hover:bg-gray-100">
              Neue Befragung
            </Link>
            <Link to="/motions/create" className="btn bg-white text-oedp-orange hover:bg-gray-100">
              Neuer Antrag
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Meine Anträge</p>
              <p className="text-3xl font-bold">{stats?.totalMotions || 0}</p>
            </div>
            <FileText className="text-oedp-orange" size={40} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktiv</p>
              <p className="text-3xl font-bold">{stats?.activeMotions || 0}</p>
            </div>
            <Clock className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unterschriften</p>
              <p className="text-3xl font-bold">{stats?.totalSignatures || 0}</p>
            </div>
            <PenTool className="text-purple-600" size={40} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Angenommen</p>
              <p className="text-3xl font-bold">{stats?.completedMotions || 0}</p>
            </div>
            <CheckCircle className="text-green-600" size={40} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-oedp-orange text-oedp-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('my-motions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'my-motions'
                  ? 'border-oedp-orange text-oedp-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meine Anträge ({myMotions.length})
            </button>
            <button
              onClick={() => setActiveTab('signatures')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'signatures'
                  ? 'border-oedp-orange text-oedp-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Unterstützte Anträge ({mySignatures.length})
            </button>
            <button
              onClick={() => setActiveTab('surveys')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'surveys'
                  ? 'border-oedp-orange text-oedp-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Befragungen ({mySurveys.length})
            </button>
            {isStaff && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'analytics'
                    ? 'border-oedp-orange text-oedp-orange'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analysen
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab myMotions={myMotions} mySignatures={mySignatures} />
          )}
          {activeTab === 'my-motions' && (
            <MyMotionsTab motions={myMotions} onRefresh={fetchDashboardData} />
          )}
          {activeTab === 'signatures' && (
            <SignaturesTab signatures={mySignatures} />
          )}
          {activeTab === 'surveys' && (
            <SurveysTab surveys={mySurveys} votes={myVotes} />
          )}
          {activeTab === 'analytics' && isStaff && (
            <AnalyticsTab />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ myMotions, mySignatures }: { myMotions: Motion[], mySignatures: any[] }) {
  const recentActivity = [
    ...myMotions.slice(0, 3).map(m => ({ type: 'motion', data: m, date: m.createdAt })),
    ...mySignatures.slice(0, 3).map(s => ({ type: 'signature', data: s, date: s.signedAt }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Aktuelle Aktivitäten</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500">Noch keine Aktivitäten</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {activity.type === 'motion' ? (
                  <>
                    <FileText className="text-oedp-orange" size={24} />
                    <div className="flex-1">
                      <Link to={`/motions/${activity.data.id}`} className="font-medium hover:text-oedp-orange">
                        {activity.data.title}
                      </Link>
                      <p className="text-sm text-gray-500">Antrag erstellt • {formatDate(activity.date)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${MOTION_STATUS_COLORS[activity.data.status as MotionStatus]}`}>
                      {MOTION_STATUS_LABELS[activity.data.status as MotionStatus]}
                    </span>
                  </>
                ) : (
                  <>
                    <PenTool className="text-purple-600" size={24} />
                    <div className="flex-1">
                      <Link to={`/motions/${activity.data.motion.id}`} className="font-medium hover:text-oedp-orange">
                        {activity.data.motion.title}
                      </Link>
                      <p className="text-sm text-gray-500">Unterschrieben • {formatDate(activity.date)}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Anträge in Unterschriftensammlung</h2>
          <Link to="/motions" className="text-oedp-orange hover:underline text-sm">
            Alle ansehen →
          </Link>
        </div>
        <div className="space-y-3">
          {myMotions.filter(m => m.status === MotionStatus.COLLECTING).slice(0, 3).map(motion => (
            <Link key={motion.id} to={`/motions/${motion.id}`} className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <h3 className="font-medium mb-2">{motion.title}</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-oedp-orange h-2 rounded-full transition-all"
                      style={{ width: `${calculateProgress(motion.signatureCount, motion.signatureThreshold)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600">{motion.signatureCount}/80</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// My Motions Tab Component
function MyMotionsTab({ motions, onRefresh }: { motions: Motion[], onRefresh: () => void }) {
  return (
    <div className="space-y-4">
      {motions.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">Sie haben noch keine Anträge erstellt</p>
          <Link to="/motions/create" className="btn btn-primary">
            Ersten Antrag erstellen
          </Link>
        </div>
      ) : (
        motions.map(motion => (
          <Link key={motion.id} to={`/motions/${motion.id}`} className="block card hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${MOTION_STATUS_COLORS[motion.status as MotionStatus]}`}>
                    {MOTION_STATUS_LABELS[motion.status as MotionStatus]}
                  </span>
                  {motion.status === MotionStatus.COLLECTING && (
                    <span className="text-sm text-gray-600">
                      {motion.signatureCount}/{motion.signatureThreshold} Unterschriften
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">{motion.title}</h3>
                <p className="text-gray-600 text-sm">{motion.description}</p>
                <p className="text-xs text-gray-500 mt-2">Erstellt: {formatDate(motion.createdAt)}</p>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

// Signatures Tab Component
function SignaturesTab({ signatures }: { signatures: any[] }) {
  return (
    <div className="space-y-4">
      {signatures.length === 0 ? (
        <div className="text-center py-12">
          <PenTool size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">Sie haben noch keine Anträge unterschrieben</p>
          <Link to="/motions" className="btn btn-primary">
            Anträge durchsuchen
          </Link>
        </div>
      ) : (
        signatures.map(sig => (
          <Link key={sig.id} to={`/motions/${sig.motion.id}`} className="block card hover:shadow-lg transition">
            <div className="flex items-center gap-4">
              <PenTool className="text-purple-600" size={24} />
              <div className="flex-1">
                <h3 className="font-medium mb-1">{sig.motion.title}</h3>
                <p className="text-sm text-gray-600">
                  Von: {sig.motion.creator.firstName} {sig.motion.creator.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unterschrieben: {formatDate(sig.signedAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${MOTION_STATUS_COLORS[sig.motion.status as MotionStatus]}`}>
                {MOTION_STATUS_LABELS[sig.motion.status as MotionStatus]}
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

// Surveys Tab Component
function SurveysTab({ surveys, votes }: { surveys: Survey[], votes: any[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Meine Befragungen</h2>
        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Sie haben noch keine Befragungen erstellt</p>
            <Link to="/surveys/create" className="btn btn-primary">
              Erste Befragung erstellen
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map(survey => (
              <Link key={survey.id} to={`/surveys/${survey.id}`} className="block card hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${SURVEY_STATUS_COLORS[survey.status as SurveyStatus]}`}>
                        {SURVEY_STATUS_LABELS[survey.status as SurveyStatus]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{survey.title}</h3>
                    <p className="text-gray-600 text-sm">{survey.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Erstellt: {formatDate(survey.createdAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Meine Abstimmungen</h2>
        {votes.length === 0 ? (
          <p className="text-gray-500">Sie haben noch an keinen Befragungen teilgenommen</p>
        ) : (
          <div className="space-y-4">
            {votes.map(vote => (
              <Link key={vote.id} to={`/surveys/${vote.survey.id}`} className="block card hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{vote.survey.title}</h3>
                    <p className="text-xs text-gray-500">Abgestimmt: {formatDate(vote.votedAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Tab Component (for staff)
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (!analytics) return <div>Lädt...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Gesamt Benutzer</p>
          <p className="text-2xl font-bold">{analytics.overview.totalUsers}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Gesamt Anträge</p>
          <p className="text-2xl font-bold">{analytics.overview.totalMotions}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">Gesamt Unterschriften</p>
          <p className="text-2xl font-bold">{analytics.overview.totalSignatures}</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3">Anträge nach Status</h3>
        <div className="space-y-2">
          {analytics.motionsByStatus?.map((item: any) => (
            <div key={item.status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="capitalize">{item.status}</span>
              <span className="font-bold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
