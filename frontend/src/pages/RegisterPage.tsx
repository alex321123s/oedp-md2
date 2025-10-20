import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    firstName: '',
    lastName: '',
    memberId: '',
    landesverband: '',
    kreisverband: '',
    postalCode: '',
    city: '',
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combine username with @oedp.de domain
      const email = `${username}@oedp.de`;
      await register({ ...formData, email });
      navigate('/login');
    } catch (error) {
      // Error handled by interceptor
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-oedp-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Registrieren</h2>
            <p className="mt-2 text-gray-600">Erstellen Sie Ihr ÖDP-MD² Konto</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="label">
                  Vorname *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="input"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="label">
                  Nachname *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="input"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="label">
                E-Mail-Adresse *
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input flex-1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="benutzername"
                  pattern="[a-zA-Z0-9._-]+"
                  title="Nur Buchstaben, Zahlen, Punkt, Unterstrich und Bindestrich erlaubt"
                />
                <span className="text-gray-700 font-medium bg-gray-100 px-4 py-2 rounded-md border border-gray-300">@oedp.de</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nur ÖDP-Mitglieder mit @oedp.de E-Mail-Adresse können sich registrieren
              </p>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Passwort *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mind. 8 Zeichen, Groß-/Kleinbuchstaben und eine Zahl
              </p>
            </div>

            <div>
              <label htmlFor="memberId" className="label">
                Mitgliedsnummer (optional)
              </label>
              <input
                id="memberId"
                name="memberId"
                type="text"
                className="input"
                value={formData.memberId}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="landesverband" className="label">
                  Landesverband (optional)
                </label>
                <input
                  id="landesverband"
                  name="landesverband"
                  type="text"
                  className="input"
                  value={formData.landesverband}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="kreisverband" className="label">
                  Kreisverband (optional)
                </label>
                <input
                  id="kreisverband"
                  name="kreisverband"
                  type="text"
                  className="input"
                  value={formData.kreisverband}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="postalCode" className="label">
                  Postleitzahl (optional)
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className="input"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="city" className="label">
                  Stadt (optional)
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Bereits registriert?{' '}
              <Link to="/login" className="text-oedp-orange hover:text-orange-600 font-medium">
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
