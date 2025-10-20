import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Info } from 'lucide-react';
import api from '../lib/api';
import { MotionType, MOTION_TYPE_LABELS, getMotionTypeInfo, requiresLegalReference } from '../types/motion';
import toast from 'react-hot-toast';

export default function CreateMotionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullText: '',
    type: MotionType.PROGRAMMAENDERUNG,
    targetParagraph: '',
    targetSection: '',
    legalReference: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  
  const selectedTypeInfo = getMotionTypeInfo(formData.type as MotionType);
  const needsLegalRef = requiresLegalReference(formData.type as MotionType);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
      };

      const response = await api.post('/api/motions', payload);
      toast.success('Antrag erfolgreich erstellt!');
      navigate(`/motions/${response.data.data.motion.id}`);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-oedp-orange" size={32} />
          <h1 className="text-3xl font-bold">Neuen Antrag erstellen</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="label">
              Antragstitel *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Z.B. Förderung erneuerbarer Energien"
              minLength={10}
              maxLength={255}
            />
            <p className="text-xs text-gray-500 mt-1">Mindestens 10 Zeichen</p>
          </div>

          <div>
            <label htmlFor="type" className="label">
              Antragstyp *
            </label>
            <select
              id="type"
              name="type"
              required
              className="input"
              value={formData.type}
              onChange={handleChange}
            >
              {Object.entries(MOTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {selectedTypeInfo && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md flex gap-2">
                <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-900 font-medium">{selectedTypeInfo.description}</p>
                  <p className="text-blue-700 mt-1">{selectedTypeInfo.helpText}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Kurzbeschreibung *
            </label>
            <textarea
              id="description"
              name="description"
              required
              className="input"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Eine kurze Zusammenfassung des Antrags"
              minLength={20}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">20-1000 Zeichen</p>
          </div>

          <div>
            <label htmlFor="fullText" className="label">
              Vollständiger Antragstext *
            </label>
            <textarea
              id="fullText"
              name="fullText"
              required
              className="input"
              rows={12}
              value={formData.fullText}
              onChange={handleChange}
              placeholder="Der vollständige Text Ihres Antrags mit Begründung"
              minLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">Mindestens 50 Zeichen</p>
          </div>

          {needsLegalRef && (
            <div>
              <label htmlFor="legalReference" className="label">
                Rechtsgrundlage * (z.B. §10.1, §15)
              </label>
              <input
                id="legalReference"
                name="legalReference"
                type="text"
                required
                className="input"
                value={formData.legalReference}
                onChange={handleChange}
                placeholder="z.B. §10.1, Satzung §15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Bitte geben Sie den betroffenen Paragraphen an
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="targetParagraph" className="label">
                Betrifft Paragraph (optional)
              </label>
              <input
                id="targetParagraph"
                name="targetParagraph"
                type="text"
                className="input"
                value={formData.targetParagraph}
                onChange={handleChange}
                placeholder="z.B. §10.1"
              />
            </div>

            <div>
              <label htmlFor="targetSection" className="label">
                Betrifft Abschnitt (optional)
              </label>
              <input
                id="targetSection"
                name="targetSection"
                type="text"
                className="input"
                value={formData.targetSection}
                onChange={handleChange}
                placeholder="z.B. Satzung, Programm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="label">
              Schlagwörter (optional)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              className="input"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Energie, Klimaschutz, Umwelt (mit Komma trennen)"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Erstelle Antrag...' : 'Als Entwurf speichern'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/motions')}
              className="btn btn-secondary"
            >
              Abbrechen
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">ℹ️ Hinweis</h3>
          <p className="text-sm text-gray-700">
            Nach dem Erstellen können Sie Ihren Antrag bearbeiten und eine Vertrauensperson festlegen. 
            Sobald Sie bereit sind, können Sie den Antrag zur Unterschriftensammlung freigeben.
          </p>
        </div>
      </div>
    </div>
  );
}
