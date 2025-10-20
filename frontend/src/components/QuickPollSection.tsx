import { useState, useEffect } from 'react';
import { BarChart3, Plus, X } from 'lucide-react';
import api from '../lib/api';
import { QuickPoll, PollResult } from '../types/comment';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface QuickPollSectionProps {
  motionId: string;
  isCreator: boolean;
}

export default function QuickPollSection({ motionId, isCreator }: QuickPollSectionProps) {
  const { isAuthenticated } = useAuthStore();
  const [polls, setPolls] = useState<QuickPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create poll form
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  // Results
  const [pollResults, setPollResults] = useState<Map<string, { results: PollResult[], totalVotes: number }>>(new Map());

  useEffect(() => {
    fetchPolls();
  }, [motionId]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/polls/motion/${motionId}`);
      const fetchedPolls = response.data.data.polls;
      setPolls(fetchedPolls);
      
      // Fetch results for each poll
      for (const poll of fetchedPolls) {
        fetchPollResults(poll.id);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPollResults = async (pollId: string) => {
    try {
      const response = await api.get(`/api/polls/${pollId}/results`);
      setPollResults(prev => new Map(prev).set(pollId, {
        results: response.data.data.results,
        totalVotes: response.data.data.totalVotes,
      }));
    } catch (error) {
      console.error('Error fetching poll results:', error);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || question.trim().length < 5) {
      toast.error('Frage muss mindestens 5 Zeichen lang sein');
      return;
    }

    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast.error('Mindestens 2 Optionen erforderlich');
      return;
    }

    try {
      setCreating(true);
      await api.post('/api/polls', {
        motionId,
        question: question.trim(),
        options: validOptions,
      });
      setQuestion('');
      setOptions(['', '']);
      setShowCreateForm(false);
      toast.success('Schnellumfrage wurde erstellt');
      fetchPolls();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erstellen');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (pollId: string, option: string) => {
    if (!isAuthenticated) {
      toast.error('Sie müssen angemeldet sein');
      return;
    }

    try {
      await api.post(`/api/polls/${pollId}/vote`, { option });
      toast.success('Stimme wurde abgegeben');
      fetchPollResults(pollId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Abstimmen');
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  if (loading) {
    return <div className="text-center py-4">Lädt Umfragen...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={24} />
          Schnellumfragen
        </h3>
        {isCreator && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-secondary"
          >
            {showCreateForm ? (
              <>
                <X size={16} className="mr-2" />
                Abbrechen
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Umfrage erstellen
              </>
            )}
          </button>
        )}
      </div>

      {/* Create Poll Form */}
      {showCreateForm && (
        <form onSubmit={handleCreatePoll} className="card bg-blue-50 border-blue-200">
          <h4 className="font-bold mb-4">Neue Schnellumfrage</h4>
          
          <div className="space-y-4">
            <div>
              <label className="label">Frage *</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input"
                placeholder="z.B. Unterstützen Sie diesen Vorschlag?"
                required
              />
            </div>

            <div>
              <label className="label">Optionen *</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="btn btn-secondary"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="btn btn-secondary btn-sm mt-2"
              >
                <Plus size={14} className="mr-1" />
                Option hinzufügen
              </button>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary w-full"
            >
              {creating ? 'Wird erstellt...' : 'Umfrage erstellen'}
            </button>
          </div>
        </form>
      )}

      {/* Polls List */}
      {polls.length === 0 ? (
        <div className="card text-center py-8">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Keine Schnellumfragen vorhanden</p>
          {isCreator && (
            <p className="text-sm text-gray-400 mt-2">
              Erstellen Sie eine Umfrage, um Meinungen zu sammeln
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const results = pollResults.get(poll.id);
            const hasVoted = false; // We could track this if needed
            
            return (
              <div key={poll.id} className="card">
                <div className="mb-4">
                  <h4 className="font-bold text-lg mb-2">{poll.question}</h4>
                  {poll.creator && (
                    <p className="text-sm text-gray-500">
                      Von: {poll.creator.firstName} {poll.creator.lastName}
                    </p>
                  )}
                </div>

                {/* Poll Options/Results */}
                <div className="space-y-3">
                  {results ? (
                    // Show results
                    results.results.map((result) => (
                      <div key={result.option}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{result.option}</span>
                          <span className="text-gray-600">
                            {result.votes} ({result.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-oedp-orange h-3 rounded-full transition-all"
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    // Vote buttons
                    poll.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleVote(poll.id, option)}
                        disabled={!isAuthenticated}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg hover:border-oedp-orange hover:bg-orange-50 transition text-left font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {option}
                      </button>
                    ))
                  )}
                </div>

                {results && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Gesamt: <span className="font-bold">{results.totalVotes}</span> Stimme{results.totalVotes !== 1 ? 'n' : ''}
                    </p>
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    <a href="/login" className="text-oedp-orange hover:underline">Anmelden</a>, um abzustimmen
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
