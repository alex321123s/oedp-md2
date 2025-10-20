import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote as VoteIcon, Users, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import api from '../lib/api';
import { Survey, SurveyStatus, SURVEY_STATUS_LABELS, SURVEY_STATUS_COLORS } from '../types/survey';
import { useAuthStore } from '../store/authStore';
import { formatDate, formatRelativeTime } from '../lib/utils';

export default function SurveysPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    fetchSurveys();
  }, [filter]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter === 'active') {
        params.status = SurveyStatus.ACTIVE;
      } else if (filter === 'completed') {
        params.status = SurveyStatus.COMPLETED;
      }
      
      const response = await api.get('/api/surveys', { params });
      setSurveys(response.data.data.surveys);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Abgelaufen';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} Tag${days > 1 ? 'e' : ''} verbleibend`;
    if (hours > 0) return `${hours} Stunde${hours > 1 ? 'n' : ''} verbleibend`;
    return 'Endet bald';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Mitgliederbefragungen</h1>
          {isAuthenticated && (
            <Link to="/surveys/create" className="btn btn-primary">
              <PlusCircle size={18} className="mr-2" />
              Neue Befragung
            </Link>
          )}
        </div>
        <p className="text-gray-600">
          Gemäß §15 Satzung können Mitgliederbefragungen zur Meinungsbildung durchgeführt werden.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setFilter('active')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              filter === 'active'
                ? 'border-oedp-orange text-oedp-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aktive Befragungen
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              filter === 'completed'
                ? 'border-oedp-orange text-oedp-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Abgeschlossene
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              filter === 'all'
                ? 'border-oedp-orange text-oedp-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alle
          </button>
        </nav>
      </div>

      {/* Surveys List */}
      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <VoteIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">Keine Befragungen gefunden</p>
          {isAuthenticated && (
            <Link to="/surveys/create" className="btn btn-primary">
              Erste Befragung erstellen
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Link
              key={survey.id}
              to={`/surveys/${survey.id}`}
              className="card hover:shadow-lg transition group"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${SURVEY_STATUS_COLORS[survey.status as SurveyStatus]}`}>
                  {SURVEY_STATUS_LABELS[survey.status as SurveyStatus]}
                </span>
                {survey.hasVoted && (
                  <CheckCircle size={18} className="text-green-600" title="Sie haben teilgenommen" />
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold mb-2 group-hover:text-oedp-orange transition">
                {survey.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {survey.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{survey.participantCount || 0} Teilnehmer</span>
                </div>
                {survey.status === SurveyStatus.ACTIVE && survey.endDate && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{getTimeRemaining(survey.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Creator */}
              {survey.creator && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Von: {survey.creator.firstName} {survey.creator.lastName}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
