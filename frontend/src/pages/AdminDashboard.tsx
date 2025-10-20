import { useState, useEffect } from 'react';
import { Users, FileText, PenTool, TrendingUp } from 'lucide-react';
import api from '../lib/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Lädt...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamt Benutzer</p>
                <p className="text-3xl font-bold">{analytics.overview.totalUsers}</p>
              </div>
              <Users className="text-oedp-orange" size={48} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Aktive Benutzer</p>
                <p className="text-3xl font-bold">{analytics.overview.activeUsers}</p>
              </div>
              <Users className="text-oedp-green" size={48} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamt Anträge</p>
                <p className="text-3xl font-bold">{analytics.overview.totalMotions}</p>
              </div>
              <FileText className="text-oedp-blue" size={48} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gesamt Unterschriften</p>
                <p className="text-3xl font-bold">{analytics.overview.totalSignatures}</p>
              </div>
              <PenTool className="text-purple-600" size={48} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Anträge nach Status</h2>
          {analytics?.motionsByStatus?.map((item: any) => (
            <div key={item.status} className="flex justify-between py-2 border-b">
              <span className="capitalize">{item.status}</span>
              <span className="font-bold">{item.count}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Aktivitäten</h2>
          <p className="text-gray-600">Neue Benutzer (30 Tage): {analytics?.overview.recentUsers}</p>
          <p className="text-gray-600 mt-2">Neue Anträge (30 Tage): {analytics?.overview.recentMotions}</p>
        </div>
      </div>
    </div>
  );
}
