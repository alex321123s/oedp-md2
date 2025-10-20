import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Users, Vote, ArrowRight, PenTool, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Motion, MotionStatus, MOTION_STATUS_LABELS, MOTION_STATUS_COLORS } from '../types/motion';
import { calculateProgress, truncate } from '../lib/utils';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeMotions, setActiveMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to dashboard
      navigate('/dashboard');
    } else {
      fetchPublicMotions();
    }
  }, [isAuthenticated, navigate]);

  const fetchPublicMotions = async () => {
    try {
      const response = await api.get('/api/motions', { 
        params: { status: MotionStatus.COLLECTING, limit: 3 } 
      });
      setActiveMotions(response.data.data.motions);
    } catch (error) {
      console.error('Error fetching motions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Compact Hero */}
      <section className="bg-gradient-to-r from-oedp-orange to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Direkte Demokratie in der ÖDP
              </h1>
              <p className="text-lg mb-6 text-white/90">
                Mitgliederanträge einreichen, unterstützen und an Entscheidungen teilhaben – transparent und digital.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="btn bg-white text-oedp-orange hover:bg-gray-100 px-6 py-3">
                  Jetzt starten <ArrowRight className="ml-2 inline" size={18} />
                </Link>
                <Link to="/motions" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-oedp-orange px-6 py-3">
                  Anträge durchsuchen
                </Link>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <FileText size={32} className="mb-2" />
                <p className="text-3xl font-bold">§10.1</p>
                <p className="text-sm text-white/80">Mitgliederanträge</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <Vote size={32} className="mb-2" />
                <p className="text-3xl font-bold">§15</p>
                <p className="text-sm text-white/80">Befragungen</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <PenTool size={32} className="mb-2" />
                <p className="text-3xl font-bold">80</p>
                <p className="text-sm text-white/80">Unterschriften</p>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <Users size={32} className="mb-2" />
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm text-white/80">Transparent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Motions Preview */}
      {!loading && activeMotions.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">🔥 Aktuell in Unterschriftensammlung</h2>
              <Link to="/motions" className="text-oedp-orange hover:underline">
                Alle Anträge →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {activeMotions.map(motion => (
                <Link 
                  key={motion.id} 
                  to={`/motions/${motion.id}`}
                  className="card hover:shadow-xl transition group"
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mb-3 inline-block ${MOTION_STATUS_COLORS[motion.status as MotionStatus]}`}>
                    {MOTION_STATUS_LABELS[motion.status as MotionStatus]}
                  </span>
                  <h3 className="font-bold mb-2 group-hover:text-oedp-orange transition">
                    {truncate(motion.title, 60)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {truncate(motion.description, 100)}
                  </p>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Unterschriften</span>
                      <span className="font-medium">{motion.signatureCount}/80</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-oedp-orange h-2 rounded-full transition-all"
                        style={{ width: `${calculateProgress(motion.signatureCount, 80)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Integrated Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">In 3 Schritten zum BPT</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Erstellen', desc: 'Formulieren Sie Ihren Antrag mit allen Details', icon: FileText },
              { num: '2', title: 'Sammeln', desc: '80 Mitglieder digital gewinnen', icon: PenTool },
              { num: '3', title: 'Einreichen', desc: 'Automatisch zum Bundesparteitag', icon: TrendingUp }
            ].map((step) => (
              <div key={step.num} className="bg-white p-6 rounded-lg text-center shadow-md">
                <div className="w-16 h-16 bg-oedp-orange text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  {step.num}
                </div>
                <step.icon className="mx-auto mb-3 text-gray-600" size={32} />
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-oedp-green to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Mitgestalten statt zuschauen</h2>
          <p className="text-lg mb-6 text-white/90">
            Ihre Stimme zählt. Registrieren Sie sich jetzt kostenlos.
          </p>
          <Link to="/register" className="btn bg-white text-oedp-green hover:bg-gray-100 text-lg px-8 py-3 inline-flex items-center">
            Kostenlos registrieren <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
