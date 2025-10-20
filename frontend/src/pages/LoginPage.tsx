import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combine username with @oedp.de domain
      const email = `${username}@oedp.de`;
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error handled by interceptor
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-oedp-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Anmelden</h2>
            <p className="mt-2 text-gray-600">Bei ÖDP-MD² anmelden</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="label">
                E-Mail-Adresse
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="username"
                  type="text"
                  required
                  className="input flex-1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="benutzername"
                />
                <span className="text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-md border border-gray-300">@oedp.de</span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Noch kein Konto?{' '}
              <Link to="/register" className="text-oedp-orange hover:text-orange-600 font-medium">
                Jetzt registrieren
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Demo-Zugänge:</p>
            <p className="text-xs text-gray-500">Admin: <strong>admin</strong> / Admin123!</p>
            <p className="text-xs text-gray-500">Member: <strong>bob</strong> / Test123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
