import { User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../lib/utils';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-oedp-orange rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-lg mb-3">Persönliche Informationen</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Mitgliedsnummer</dt>
                <dd className="font-medium">{user.memberId || 'Nicht angegeben'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Rolle</dt>
                <dd className="font-medium capitalize">{user.role}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Mitgliedsstatus</dt>
                <dd className="font-medium capitalize">{user.membershipStatus}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Mitglied seit</dt>
                <dd className="font-medium">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Verbandsinfo</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Landesverband</dt>
                <dd className="font-medium">{user.landesverband || 'Nicht angegeben'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Kreisverband</dt>
                <dd className="font-medium">{user.kreisverband || 'Nicht angegeben'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <button className="btn btn-secondary">Profil bearbeiten</button>
        </div>
      </div>
    </div>
  );
}
