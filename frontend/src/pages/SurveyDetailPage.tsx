import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { Survey, Vote, QuestionType, SurveyStatus, SURVEY_STATUS_LABELS, SURVEY_STATUS_COLORS, QUESTION_TYPE_LABELS } from '../types/survey';
import { useAuthStore } from '../store/authStore';
import { formatDate, formatRelativeTime } from '../lib/utils';
import { CommentType } from '../types/comment';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Vote state
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [freeTextAnswer, setFreeTextAnswer] = useState('');

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/surveys/${id}`);
      const surveyData = response.data.data.survey;
      setSurvey(surveyData);
      
      // Show results if user has voted or survey is completed
      if (surveyData.hasVoted || surveyData.status === SurveyStatus.COMPLETED) {
        fetchResults();
      }
    } catch (error) {
      console.error('Error fetching survey:', error);
      toast.error('Befragung konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get(`/api/surveys/${id}/results`);
      setResults(response.data.data.results);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Sie müssen angemeldet sein, um teilzunehmen');
      navigate('/login');
      return;
    }

    let voteValue: any;

    if (survey?.questionType === QuestionType.SINGLE_CHOICE || survey?.questionType === QuestionType.YES_NO) {
      if (!selectedOption) {
        toast.error('Bitte wählen Sie eine Option');
        return;
      }
      voteValue = selectedOption;
    } else if (survey?.questionType === QuestionType.MULTIPLE_CHOICE) {
      if (selectedOptions.length === 0) {
        toast.error('Bitte wählen Sie mindestens eine Option');
        return;
      }
      voteValue = selectedOptions;
    } else if (survey?.questionType === QuestionType.FREE_TEXT) {
      if (!freeTextAnswer.trim()) {
        toast.error('Bitte geben Sie eine Antwort ein');
        return;
      }
      voteValue = freeTextAnswer;
    }

    try {
      setSubmitting(true);
      await api.post(`/api/surveys/${id}/vote`, { voteValue });
      toast.success('Ihre Stimme wurde erfolgreich abgegeben');
      fetchSurvey();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Abstimmen');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMultipleChoice = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const calculatePercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  if (loading || !survey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/surveys" className="inline-flex items-center text-gray-600 hover:text-oedp-orange mb-6">
        <ArrowLeft size={18} className="mr-2" />
        Zurück zu Befragungen
      </Link>

      {/* Survey Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${SURVEY_STATUS_COLORS[survey.status as SurveyStatus]}`}>
            {SURVEY_STATUS_LABELS[survey.status as SurveyStatus]}
          </span>
          {survey.hasVoted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Sie haben teilgenommen</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
        <p className="text-gray-700 mb-6">{survey.description}</p>

        {/* Survey Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Fragentyp</p>
            <p className="font-medium">{QUESTION_TYPE_LABELS[survey.questionType as QuestionType]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teilnehmer</p>
            <p className="font-medium flex items-center gap-2">
              <Users size={18} />
              {survey.participantCount || 0}
            </p>
          </div>
          {survey.endDate && (
            <div>
              <p className="text-sm text-gray-500">Ende</p>
              <p className="font-medium flex items-center gap-2">
                <Clock size={18} />
                {formatDate(survey.endDate)}
              </p>
            </div>
          )}
        </div>

        {survey.creator && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Erstellt von: <span className="font-medium text-gray-700">{survey.creator.firstName} {survey.creator.lastName}</span>
            </p>
          </div>
        )}
      </div>

      {/* Voting Section or Results */}
      {!survey.hasVoted && survey.status === SurveyStatus.ACTIVE && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Ihre Stimme</h2>

          {/* Single Choice / Yes-No */}
          {(survey.questionType === QuestionType.SINGLE_CHOICE || survey.questionType === QuestionType.YES_NO) && (
            <div className="space-y-3">
              {survey.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-oedp-orange transition"
                >
                  <input
                    type="radio"
                    name="vote"
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Multiple Choice */}
          {survey.questionType === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Mehrfachauswahl möglich</p>
              {survey.options.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-oedp-orange transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => toggleMultipleChoice(option)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {/* Free Text */}
          {survey.questionType === QuestionType.FREE_TEXT && (
            <div>
              <textarea
                value={freeTextAnswer}
                onChange={(e) => setFreeTextAnswer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oedp-orange focus:border-transparent"
                rows={6}
                placeholder="Ihre Antwort..."
              />
            </div>
          )}

          <button
            onClick={handleVote}
            disabled={submitting}
            className="btn btn-primary w-full mt-6"
          >
            {submitting ? 'Wird abgesendet...' : 'Stimme abgeben'}
          </button>

          {survey.isAnonymous && (
            <p className="text-sm text-gray-500 text-center mt-4">
              🔒 Diese Befragung ist anonym
            </p>
          )}
        </div>
      )}

      {/* Results Section */}
      {showResults && results && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Ergebnisse</h2>

          {(survey.questionType === QuestionType.SINGLE_CHOICE || survey.questionType === QuestionType.YES_NO || survey.questionType === QuestionType.MULTIPLE_CHOICE) && (
            <div className="space-y-4">
              {Object.keys(results.options).map((option) => {
                const data = results.options[option];
                return (
                  <div key={option}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{option}</span>
                      <span className="text-gray-600">
                        {data.count} ({data.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-oedp-orange h-4 rounded-full transition-all"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {survey.questionType === QuestionType.FREE_TEXT && results.responses && (
            <div className="space-y-3">
              {results.responses.map((response: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{response.response}</p>
                  <p className="text-xs text-gray-500 mt-2">{formatRelativeTime(response.votedAt)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Gesamt: <span className="font-bold">{results.totalVotes}</span> Teilnehmer
            </p>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <CommentSection
          entityType={CommentType.SURVEY}
          entityId={survey.id}
        />
      </div>
    </div>
  );
}
