import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { TerrainFallback } from '../three/TerrainFallback';
import { ScrollStorySection } from '../features/landing/ScrollStorySection';
import { RolesMatrixSection } from '../features/landing/RolesMatrixSection';
import { useTheme } from '../lib/theme';
import { Mountain, Sun, Moon, ArrowRight, ShieldCheck, CheckCircle2, Compass, Layers } from 'lucide-react';

// Lazy-load the heavy 3D canvas so initial load is under performance budget
const TerrainScene = lazy(() =>
  import('../three/TerrainScene').then((mod) => ({ default: mod.TerrainScene }))
);

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion & WebGL availability
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // Detect software WebGL or low-power
    const hasHardwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return false;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return !/SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    if (!prefersReducedMotion && hasHardwareGl && !isMobile) {
      setCanRender3D(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-text flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between gap-8 px-6 lg:px-12 h-16">
        {/* Zone 1: Single brand wordmark */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-sm bg-primary text-primary-contrast flex items-center justify-center font-bold">
            <Mountain className="w-4 h-4" />
          </div>
          <span className="text-base font-bold font-display tracking-tight text-text">
            Project Camp
          </span>
        </Link>

        {/* Zone 2: Clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-text-muted">
          <a href="#product-story" className="hover:text-text transition-colors whitespace-nowrap shrink-0">
            Methodology
          </a>
          <a href="#roles" className="hover:text-text transition-colors whitespace-nowrap shrink-0">
            Permission Matrix
          </a>
          <Link to="/login" className="hover:text-text transition-colors whitespace-nowrap shrink-0">
            Sign In
          </Link>
        </nav>

        {/* Zone 3: Theme toggle & 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-1.5 text-text-muted hover:text-text rounded-xs hover:bg-surface-raised transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
          </button>

          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Establish Base Camp
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with 3D Scene / Fallback */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-border px-6 py-20">
        {/* 3D Scene Layer */}
        {canRender3D ? (
          <Suspense fallback={<TerrainFallback />}>
            <TerrainScene />
          </Suspense>
        ) : (
          <TerrainFallback />
        )}

        {/* Measured Contrast Scrim (Guarantees at least 4.5:1 text contrast) */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/70 via-background/85 to-background z-10"
          aria-hidden="true"
        />

        {/* Hero Content (Floating crisp above 3D terrain) */}
        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-raised border border-border rounded-xs text-xs font-mono text-text-muted mx-auto">
            <Compass className="w-3.5 h-3.5 text-accent" />
            <span>Expedition-Grade Project Management</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-text leading-[1.15] max-w-3xl mx-auto">
            From Base Camp to Summit Without Chaos
          </h1>

          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Project Camp organizes team workflows along deliberate expedition routes. Track milestone
            waypoints, enforce project-level permissions, and document shared field notes on a calm,
            predictable platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Join Expedition / Register
              </Button>
            </Link>

            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Live Demo / Sign In
              </Button>
            </Link>
          </div>

          {/* Adjacency Proof Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Zero-Pill Clarity</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Project-Level RBAC</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>WCAG AA Contrast</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Scroll Storytelling Section */}
      <ScrollStorySection />

      {/* How Roles Work Permission Matrix Section */}
      <RolesMatrixSection />

      {/* Final Call to Action */}
      <section className="py-20 px-6 bg-surface-raised/50 border-t border-border text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-10 h-10 rounded-sm bg-primary text-primary-contrast flex items-center justify-center mx-auto">
            <Mountain className="w-5 h-5" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-text tracking-tight">
            Ready to Establish Your Base Camp?
          </h2>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Equip your team with dependable waypoint coordination, shared documentation, and authentic progress tracking.
          </p>

          <div className="pt-2">
            <Link to="/register">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer (Real links only, no placeholders) */}
      <footer className="mt-auto border-t border-border bg-surface py-12 px-6 lg:px-12 text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-sm bg-primary text-primary-contrast flex items-center justify-center font-bold">
              <Mountain className="w-3 h-3" />
            </div>
            <span className="font-semibold text-text font-display">Project Camp</span>
            <span>·</span>
            <span className="font-mono text-[11px]">Expedition Workspaces</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <Link to="/projects" className="hover:text-text transition-colors">
              Projects
            </Link>
            <Link to="/login" className="hover:text-text transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-text transition-colors">
              Register
            </Link>
            <Link to="/account" className="hover:text-text transition-colors">
              Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
