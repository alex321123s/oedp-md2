import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Seite nicht gefunden</h2>
        <p className="text-gray-600 mb-8">
          Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={18} className="mr-2" />
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
