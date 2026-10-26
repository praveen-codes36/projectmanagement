import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { Mountain, Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-sm bg-surface-raised border border-border flex items-center justify-center text-text-muted mb-4">
        <Compass className="w-6 h-6 text-accent" />
      </div>

      <span className="font-mono text-xs text-accent font-semibold tracking-wide uppercase mb-1">
        Coordinate Not Found · 404
      </span>
      <h1 className="text-2xl font-bold font-display text-text mb-2">Off Trail Territory</h1>
      <p className="text-xs text-text-muted max-w-sm mb-6 leading-relaxed">
        The coordinates or route waypoint you requested does not exist or has been shifted in this expedition workspace.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/projects">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Projects
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="md" leftIcon={<Mountain className="w-4 h-4" />}>
            Base Camp Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
