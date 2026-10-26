import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ListTodo, Shield, FileText, Paperclip, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface StoryStage {
  id: string;
  number: string;
  title: string;
  summary: string;
  details: string[];
  icon: React.ReactNode;
  uiMock: {
    tag: string;
    headline: string;
    sub: string;
    stats: string;
  };
}

const STORY_STAGES: StoryStage[] = [
  {
    id: 'plan-tasks',
    number: '01',
    title: 'Chart your expedition with structured waypoints',
    summary:
      'Break complex product milestones into manageable subtasks, set clear statuses, and track velocity along an authentic elevation line.',
    details: [
      'Kanban board and dense table views with persistent layout memory',
      'Nested subtask checkpoints with single-click completion',
      'Instant keyboard shortcuts (⌘K) to jump across projects and commands',
    ],
    icon: <ListTodo className="w-5 h-5 text-primary" />,
    uiMock: {
      tag: 'Waypoint Logistics',
      headline: 'Survey Alpine Ridge Descent',
      sub: '4 checkpoints completed · 2 remaining',
      stats: '66% Route Complete',
    },
  },
  {
    id: 'assign-roles',
    number: '02',
    title: 'Deploy project-level governance without bureaucratic friction',
    summary:
      'Control workspace permissions precisely. Designate Admins for operational authority, Project Admins for task execution, and Members for focused contribution.',
    details: [
      'Project-level access control enforced cryptographically on every request',
      'Clear error feedback when managing members and roles',
      'Transparent permission explanations on disabled actions',
    ],
    icon: <Shield className="w-5 h-5 text-accent" />,
    uiMock: {
      tag: 'Access Control',
      headline: 'Expedition Team Roster',
      sub: '1 Admin · 2 Project Admins · 4 Members',
      stats: 'RBAC Enforced',
    },
  },
  {
    id: 'share-notes',
    number: '03',
    title: 'Maintain living field notes and retrospective logs',
    summary:
      'Centralize team findings, meeting briefings, and post-mortem observations directly alongside active tasks so context is never lost.',
    details: [
      'Admin-authored documentation accessible to all project members',
      'Formatted pre-wrap text with author attribution and update timestamps',
      'Zero external wiki silos or fragmented communication threads',
    ],
    icon: <FileText className="w-5 h-5 text-emerald-600" />,
    uiMock: {
      tag: 'Field Briefings',
      headline: 'Ascent Retrospective & Observations',
      sub: 'Published by Team Lead · 2 hours ago',
      stats: 'Shared Context',
    },
  },
  {
    id: 'attach-files',
    number: '04',
    title: 'Anchor technical specifications and assets to every task',
    summary:
      'Attach survey schematics, telemetry logs, and design assets directly to waypoints with real-time size computation and verified previews.',
    details: [
      'Multi-file attachment support with 10MB individual size validation',
      'Direct browser viewing and downloads with httpOnly authenticated routes',
      'Instant file removal and update controls for workspace admins',
    ],
    icon: <Paperclip className="w-5 h-5 text-sky-600" />,
    uiMock: {
      tag: 'Field Artifacts',
      headline: 'Topographic_Survey_V2.pdf',
      sub: '3.4 MB · Verified integrity',
      stats: 'Secure Delivery',
    },
  },
];

export function ScrollStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize smooth scroll with Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const frameId = requestAnimationFrame(raf);

    // GSAP ScrollTrigger for pinned stages
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const index = Math.min(
            STORY_STAGES.length - 1,
            Math.floor(self.progress * STORY_STAGES.length)
          );
          setActiveStage(index);
        },
      });
    }, containerRef);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  const current = STORY_STAGES[activeStage] || STORY_STAGES[0];

  return (
    <section
      ref={containerRef}
      id="product-story"
      className="relative min-h-screen bg-background border-t border-b border-border flex items-center justify-center p-6 md:p-12 overflow-hidden"
    >
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Accessible Navigation Anchors & Editorial Copy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Accessible Step Anchors */}
          <div className="flex items-center gap-2 flex-wrap" role="navigation" aria-label="Product story stages">
            {STORY_STAGES.map((stage, idx) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={cn(
                  'px-3 py-1.5 text-xs font-mono rounded-xs border transition-colors cursor-pointer select-none',
                  activeStage === idx
                    ? 'bg-primary text-primary-contrast border-primary font-bold'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                )}
              >
                {stage.number}. {stage.id.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <span className="font-mono text-xs text-accent font-semibold tracking-wider">
              STAGE {current.number} OF 04
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-text tracking-tight leading-tight">
              {current.title}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed max-w-xl">
              {current.summary}
            </p>
          </div>

          <ul className="space-y-2.5 pt-2">
            {current.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-text">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Interactive UI Visual Representation */}
        <div className="lg:col-span-5">
          <div className="p-6 border border-border rounded-md bg-surface shadow-md space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                {current.icon}
                <span className="text-xs font-mono font-medium text-text">
                  {current.uiMock.tag}
                </span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-text-muted bg-surface-raised px-2 py-0.5 rounded-xs border border-border">
                {current.uiMock.stats}
              </span>
            </div>

            <div className="space-y-2 py-4">
              <h3 className="text-base font-semibold text-text">{current.uiMock.headline}</h3>
              <p className="text-xs text-text-muted">{current.uiMock.sub}</p>
            </div>

            {/* Expedition Route Accent Line */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Active Expedition Mechanism
              </span>
              <span>WCAG AA Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
