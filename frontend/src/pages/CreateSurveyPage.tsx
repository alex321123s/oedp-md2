import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { QuestionType, QUESTION_TYPE_LABELS } from '../types/survey';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateSurveyPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.SINGLE_CHOICE);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [durationDays, setDurationDays] = useState(7);
  const [coInitiatorIds, setCoInitiatorIds] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isBinding, setIsBinding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/api/users');
      // Filter out current user
      const allUsers = response.data.data.users.filter((u: User) => u.id !== user?.id);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
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

  const toggleCoInitiator = (userId: string) => {
    if (coInitiatorIds.includes(userId)) {
      setCoInitiatorIds(coInitiatorIds.filter(id => id !== userId));
    } else {
      setCoInitiatorIds([...coInitiatorIds, userId]);
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (title.length < 10) {
      toast.error('Titel muss mindestens 10 Zeichen lang sein');
      return;
    }

    if (description.length < 20) {
      toast.error('Beschreibung muss mindestens 20 Zeichen lang sein');
      return;
    }

    if (coInitiatorIds.length < 19) {
      toast.error('Sie benötigen mindestens 19 weitere Mitglieder (20 insgesamt gemäß §15 Satzung)');
      return;
    }

    if (questionType !== QuestionType.YES_NO && questionType !== QuestionType.FREE_TEXT) {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) {
        toast.error('Mindestens 2 Optionen erforderlich');
        return;
      }
    }

    try {
      setLoading(true);

      const surveyData: any = {
        title,
        description,
        questionType,
        durationDays,
        coInitiatorIds,
        isAnonymous,
        isBinding,
      };

      // Add options for relevant question types
      if (questionType !== QuestionType.YES_NO && questionType !== QuestionType.FREE_TEXT) {
        surveyData.options = options.filter(o => o.trim());
      }

      await api.post('/api/surveys', surveyData);
      toast.success('Befragung wurde erstellt und wartet auf Genehmigung durch den BGSt');
      navigate('/surveys');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fehler beim Erstellen der Befragung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <Link to="/surveys" className="inline-flex items-center text-gray-600 hover:text-oedp-orange mb-6">
        <ArrowLeft size={18} className="mr-2" />
        Zurück zu Befragungen
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Neue Mitgliederbefragung</h1>
        <p className="text-gray-600">
          Gemäß §15 Satzung können 20 Mitglieder eine Befragung zur Meinungsbildung initiieren.
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Hinweise:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Es werden mindestens 20 Mitglieder (Sie + 19 weitere) benötigt</li>
            <li>Die Befragung muss vom BGSt genehmigt werden</li>
            <li>Dauer: 2-14 Tage</li>
            <li>Ergebnisse werden automatisch an den Bundesvorstand gesendet</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <label className="label">Titel der Befragung *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="z.B. Meinungsbild zur Energiepolitik"
            required
            minLength={10}
          />
          <p className="text-sm text-gray-500 mt-1">{title.length}/255 Zeichen (mind. 10)</p>
        </div>

        {/* Description */}
        <div className="card">
          <label className="label">Beschreibung *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={4}
            placeholder="Beschreiben Sie den Hintergrund und Zweck der Befragung..."
            required
            minLength={20}
          />
          <p className="text-sm text-gray-500 mt-1">{description.length} Zeichen (mind. 20)</p>
        </div>

        {/* Question Type */}
        <div className="card">
          <label className="label">Fragentyp *</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            className="input"
            required
          >
            {Object.values(QuestionType).map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Options (for non-yes/no and non-free-text) */}
        {questionType !== QuestionType.YES_NO && questionType !== QuestionType.FREE_TEXT && (
          <div className="card">
            <label className="label">Antwortoptionen *</label>
            <div className="space-y-3">
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
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="btn btn-secondary mt-3"
            >
              <Plus size={18} className="mr-2" />
              Option hinzufügen
            </button>
          </div>
        )}

        {/* Duration */}
        <div className="card">
          <label className="label">Dauer (Tage) *</label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value))}
            className="input"
            min={2}
            max={14}
            required
          />
          <p className="text-sm text-gray-500 mt-1">Zwischen 2 und 14 Tagen</p>
        </div>

        {/* Settings */}
        <div className="card space-y-4">
          <h3 className="font-bold text-lg mb-4">Einstellungen</h3>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <span className="font-medium">Anonyme Abstimmung</span>
              <p className="text-sm text-gray-500">Stimmen werden anonym erfasst</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isBinding}
              onChange={(e) => setIsBinding(e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <span className="font-medium">Verbindliche Befragung</span>
              <p className="text-sm text-gray-500">Ergebnis hat bindenden Charakter</p>
            </div>
          </label>
        </div>

        {/* Co-Initiators */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4">
            Mitunterzeichner auswählen ({coInitiatorIds.length}/19)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Wählen Sie mindestens 19 weitere Mitglieder aus, die diese Befragung unterstützen.
          </p>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input mb-4"
            placeholder="Mitglied suchen..."
          />

          {/* User List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y">
            {loadingUsers ? (
              <p className="p-4 text-center text-gray-500">Lädt Mitglieder...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="p-4 text-center text-gray-500">Keine Mitglieder gefunden</p>
            ) : (
              filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={coInitiatorIds.includes(user.id)}
                    onChange={() => toggleCoInitiator(user.id)}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          {coInitiatorIds.length < 19 && (
            <p className="text-sm text-red-600 mt-2">
              Noch {19 - coInitiatorIds.length} weitere Mitunterzeichner erforderlich
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || coInitiatorIds.length < 19}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Wird erstellt...' : 'Befragung einreichen'}
          </button>
          <Link to="/surveys" className="btn btn-secondary">
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}
