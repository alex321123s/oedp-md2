import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import api from '../lib/api';
import { Motion, MotionStatus, MOTION_STATUS_LABELS, MOTION_STATUS_COLORS } from '../types/motion';
import { formatDate } from '../lib/utils';

export default function MyMotionsPage() {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyMotions();
  }, []);

  const fetchMyMotions = async () => {
    try {
      const response = await api.get('/api/motions/my/motions');
      setMotions(response.data.data.motions);
    } catch (error) {
      console.error('Error fetching motions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Lädt...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meine Anträge</h1>
        <Link to="/motions/create" className="btn btn-primary">+ Neuer Antrag</Link>
      </div>

      {motions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Sie haben noch keine Anträge erstellt</p>
          <Link to="/motions/create" className="btn btn-primary mt-4">Ersten Antrag erstellen</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {motions.map((motion) => (
            <Link key={motion.id} to={`/motions/${motion.id}`} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${MOTION_STATUS_COLORS[motion.status as MotionStatus]}`}>
                    {MOTION_STATUS_LABELS[motion.status as MotionStatus]}
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-2">{motion.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{motion.description}</p>
                  <p className="text-sm text-gray-500">
                    Erstellt: {formatDate(motion.createdAt)} • Unterschriften: {motion.signatureCount}/{motion.signatureThreshold}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
