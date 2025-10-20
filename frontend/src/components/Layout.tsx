import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus,
  Settings,
  Menu,
  X,
  Vote
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, isAuthenticated, logout, fetchUser } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'bgst' || user?.role === 'bantrk';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-oedp-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Ö</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900">ÖDP-MD²</span>
                <span className="text-xs text-gray-500">Mitgliederportal</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/motions" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <FileText size={18} />
                    <span>Anträge</span>
                  </Link>
                  <Link to="/surveys" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <Vote size={18} />
                    <span>Befragungen</span>
                  </Link>
                  <Link to="/motions/create" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <PlusCircle size={18} />
                    <span>Erstellen</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <Home size={18} />
                    <span>Startseite</span>
                  </Link>
                  <Link to="/motions" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <FileText size={18} />
                    <span>Anträge</span>
                  </Link>
                  <Link to="/surveys" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <Vote size={18} />
                    <span>Befragungen</span>
                  </Link>
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                      <Settings size={18} />
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link to="/profile" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <User size={18} />
                    <span>{user?.firstName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 flex items-center space-x-1"
                  >
                    <LogOut size={18} />
                    <span>Abmelden</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-1">
                    <LogIn size={18} />
                    <span>Anmelden</span>
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    <UserPlus size={18} className="inline mr-1" />
                    Registrieren
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-3">
                <Link to="/" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                  <Home size={18} />
                  <span>Startseite</span>
                </Link>
                <Link to="/motions" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                  <FileText size={18} />
                  <span>Anträge</span>
                </Link>
                <Link to="/surveys" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                  <Vote size={18} />
                  <span>Befragungen</span>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/motions/create" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <PlusCircle size={18} />
                      <span>Antrag erstellen</span>
                    </Link>
                    <Link to="/my-motions" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <FileText size={18} />
                      <span>Meine Anträge</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                        <Settings size={18} />
                        <span>Admin</span>
                      </Link>
                    )}
                    <Link to="/profile" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <User size={18} />
                      <span>Profil</span>
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-gray-700 hover:text-red-600 flex items-center space-x-2 py-2 text-left">
                      <LogOut size={18} />
                      <span>Abmelden</span>
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-oedp-orange flex items-center space-x-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn size={18} />
                      <span>Anmelden</span>
                    </Link>
                    <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                      <UserPlus size={18} className="inline mr-1" />
                      Registrieren
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">ÖDP-MD²</h3>
              <p className="text-gray-400 text-sm">
                Mitgliederportal für Direkte Demokratie innerhalb der Ökologisch-Demokratischen Partei
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3">Rechtliche Dokumente</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/Satzung.pdf" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Satzung der ÖDP</a></li>
                <li><a href="https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/Finanzordnung.pdf" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Finanzordnung</a></li>
                <li><a href="https://www.oedp.de/fileadmin/user_upload/01-instanzen/00/partei/satzungen/BundesschiedsgerichtsOrdnung.pdf" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Schiedsgerichtsordnung</a></li>
                <li><a href="https://www.oedp.de/programm/grundsatzprogramm" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Grundsatzprogramm</a></li>
                <li><a href="https://www.oedp.de/partei/satzungen-und-geschaeftsordnungen" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Alle Dokumente →</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3">Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.oedp.de" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">ÖDP Website</a></li>
                <li><a href="https://www.oedp.de/datenschutz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Datenschutz</a></li>
                <li><a href="https://www.oedp.de/impressum" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Impressum</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3">Kontakt</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 it-support@oedp.de</li>
                <li>📞 +49 (0) 9391 504 61</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} ÖDP Bundesverband. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
