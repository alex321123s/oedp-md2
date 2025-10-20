import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, User, Calendar, CheckCircle, Download, PenLine } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Motion, MotionStatus, MOTION_STATUS_LABELS, MOTION_STATUS_COLORS, MOTION_TYPE_LABELS } from '../types/motion';
import { formatDate, formatDateTime, calculateProgress } from '../lib/utils';
import { CommentType } from '../types/comment';
import CommentSection from '../components/CommentSection';
import QuickPollSection from '../components/QuickPollSection';
import toast from 'react-hot-toast';

export default function MotionDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [motion, setMotion] = useState<Motion | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    fetchMotion();
  }, [id]);

  const fetchMotion = async () => {
    try {
      const response = await api.get(`/api/motions/${id}`);
      const motionData = response.data.data.motion;
      setMotion(motionData);
      
      if (isAuthenticated && user && motionData.signatures) {
        setHasSigned(motionData.signatures.some((sig: any) => sig.signerId === user.id));
      }
    } catch (error) {
      console.error('Error fetching motion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!isAuthenticated) {
      toast.error('Bitte melden Sie sich an, um zu unterschreiben');
      return;
    }

    try {
      await api.post(`/api/motions/${id}/sign`);
      toast.success('Unterschrift erfolgreich hinzugefügt!');
      fetchMotion();
    } catch (error: any) {
      // Error handled by interceptor
    }
  };

  const handleRemoveSignature = async () => {
    try {
      await api.delete(`/api/motions/${id}/sign`);
      toast.success('Unterschrift entfernt');
      fetchMotion();
    } catch (error: any) {
      // Error handled by interceptor
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center">Lädt...</div>;
  }

  if (!motion) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center">Antrag nicht gefunden</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to="/motions" className="text-oedp-orange hover:underline">← Zurück zu Anträge</Link>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${MOTION_STATUS_COLORS[motion.status as MotionStatus]}`}>
            {MOTION_STATUS_LABELS[motion.status as MotionStatus]}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {MOTION_TYPE_LABELS[motion.type]}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-4">{motion.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>{motion.creator.firstName} {motion.creator.lastName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(motion.createdAt)}</span>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <h3 className="font-bold mb-2">Beschreibung</h3>
          <p className="text-gray-700">{motion.description}</p>
        </div>

        <div className="prose max-w-none mb-6">
          <h3 className="font-bold mb-2">Antragstext</h3>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{motion.fullText}</div>
        </div>

        {motion.targetParagraph && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Betrifft Paragraph</h3>
            <p className="text-gray-700">{motion.targetParagraph}</p>
          </div>
        )}

        {motion.status === MotionStatus.COLLECTING && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Unterschriften</h3>
              <span className="text-gray-600">
                {motion.signatureCount} / {motion.signatureThreshold}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-oedp-orange h-3 rounded-full transition-all"
                style={{ width: `${calculateProgress(motion.signatureCount, motion.signatureThreshold)}%` }}
              />
            </div>

            {isAuthenticated && (
              <div>
                {hasSigned ? (
                  <button onClick={handleRemoveSignature} className="btn btn-secondary">
                    Unterschrift zurückziehen
                  </button>
                ) : (
                  <button onClick={handleSign} className="btn btn-success">
                    <PenLine size={18} className="mr-2" />
                    Jetzt unterschreiben
                  </button>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-gray-600">
                <Link to="/login" className="text-oedp-orange hover:underline">Melden Sie sich an</Link>, um diesen Antrag zu unterstützen
              </p>
            )}
          </div>
        )}

        {motion.trustPerson && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold mb-2">Vertrauensperson</h3>
            <p>{motion.trustPerson.firstName} {motion.trustPerson.lastName}</p>
            {motion.backupTrustPerson && (
              <>
                <h3 className="font-bold mt-3 mb-2">Ersatzperson</h3>
                <p>{motion.backupTrustPerson.firstName} {motion.backupTrustPerson.lastName}</p>
              </>
            )}
          </div>
        )}

        {/* Quick Polls */}
        <div className="mt-8">
          <QuickPollSection
            motionId={motion.id}
            isCreator={user?.id === motion.creator?.id}
          />
        </div>

        {/* Comments */}
        <div className="mt-8">
          <CommentSection
            entityType={CommentType.MOTION}
            entityId={motion.id}
          />
        </div>
      </div>
    </div>
  );
}
