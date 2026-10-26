export function TerrainFallback() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-40 dark:opacity-30"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Topographic Contour Curves */}
        <path
          d="M-100 200 C300 120, 600 350, 900 220 C1200 90, 1400 300, 1600 250"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary/30"
        />
        <path
          d="M-100 320 C250 240, 550 480, 850 340 C1150 200, 1350 420, 1600 370"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary/40"
        />
        <path
          d="M-100 450 C200 360, 500 600, 800 460 C1100 320, 1300 540, 1600 490"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary/30"
        />
        <path
          d="M-100 580 C150 480, 450 720, 750 580 C1050 440, 1250 660, 1600 610"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary/20"
        />

        {/* Expedition Route Vector Path */}
        <path
          d="M150 520 L420 380 L760 440 L1080 260 L1320 310"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          className="text-accent"
        />

        {/* Waypoint Nodes */}
        <circle cx="150" cy="520" r="6" className="fill-primary" />
        <circle cx="420" cy="380" r="5" className="fill-accent" />
        <circle cx="760" cy="440" r="5" className="fill-accent" />
        <circle cx="1080" cy="260" r="5" className="fill-accent" />
        <circle cx="1320" cy="310" r="7" className="fill-primary" />
      </svg>
    </div>
  );
}
