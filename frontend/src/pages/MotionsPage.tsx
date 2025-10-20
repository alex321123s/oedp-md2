import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter } from 'lucide-react';
import api from '../lib/api';
import { Motion, MotionStatus, MOTION_STATUS_LABELS, MOTION_STATUS_COLORS } from '../types/motion';
import { formatDate, truncate, calculateProgress } from '../lib/utils';

export default function MotionsPage() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMotions();
  }, []);

  const fetchMotions = async () => {
    try {
      const response = await api.get('/api/motions');
      setMotions(response.data.data.motions);
    } catch (error) {
      console.error('Error fetching motions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMotions = motions.filter((motion) =>
    motion.title.toLowerCase().includes(search.toLowerCase()) ||
    motion.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Lädt...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mitgliederanträge</h1>
        <Link to="/motions/create" className="btn btn-primary">
          + Neuer Antrag
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Anträge durchsuchen..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredMotions.map((motion) => (
          <Link
            key={motion.id}
            to={`/motions/${motion.id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      MOTION_STATUS_COLORS[motion.status as MotionStatus]
                    }`}
                  >
                    {MOTION_STATUS_LABELS[motion.status as MotionStatus]}
                  </span>
                  {motion.tags && motion.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-2">{motion.title}</h3>
                <p className="text-gray-600 mb-3">{truncate(motion.description, 150)}</p>
                <p className="text-sm text-gray-500">
                  Von: {motion.creator.firstName} {motion.creator.lastName} • {formatDate(motion.createdAt)}
                </p>
              </div>
            </div>

            {motion.status === MotionStatus.COLLECTING && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Unterschriften</span>
                  <span className="font-medium">
                    {motion.signatureCount} / {motion.signatureThreshold}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-oedp-orange h-2 rounded-full transition-all"
                    style={{ width: `${calculateProgress(motion.signatureCount, motion.signatureThreshold)}%` }}
                  />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {filteredMotions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Keine Anträge gefunden</p>
        </div>
      )}
    </div>
  );
}
