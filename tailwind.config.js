/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* === BACKGROUND & SURFACES (OLED DARK) === */
        background: {
          DEFAULT: "var(--color-bg-app, #000000)",
          app: "var(--color-bg-app, #000000)",
          surface: "var(--color-surface-card, #121214)",
          "surface-hover": "var(--color-surface-card-hover, #18181B)",
          elevated: "var(--color-surface-elevated, #1E1E22)",
          highlight: "var(--color-surface-highlight, #27272A)",
          overlay: "var(--color-surface-overlay, rgba(0, 0, 0, 0.75))",
        },
        surface: {
          DEFAULT: "var(--color-surface-card, #121214)",
          card: "var(--color-surface-card, #121214)",
          hover: "var(--color-surface-card-hover, #18181B)",
          elevated: "var(--color-surface-elevated, #1E1E22)",
          highlight: "var(--color-surface-highlight, #27272A)",
        },

        /* === PRIMARY / HEVY ACCENT === */
        primary: {
          DEFAULT: "var(--color-primary, #007AFF)",
          hover: "var(--color-primary-hover, #258CFF)",
          active: "var(--color-primary-active, #0062CC)",
          muted: "var(--color-primary-muted, rgba(0, 122, 255, 0.15))",
          foreground: "var(--color-primary-foreground, #FFFFFF)",
        },

        /* === WORKOUT SETS & SEMANTIC ACCENTS === */
        accent: {
          pr: {
            DEFAULT: "var(--color-accent-pr, #22C55E)",
            muted: "var(--color-accent-pr-muted, rgba(34, 197, 94, 0.15))",
          },
          warmup: {
            DEFAULT: "var(--color-accent-warmup, #F59E0B)",
            muted: "var(--color-accent-warmup-muted, rgba(245, 158, 11, 0.15))",
          },
          drop: {
            DEFAULT: "var(--color-accent-drop, #EF4444)",
            muted: "var(--color-accent-drop-muted, rgba(239, 68, 68, 0.15))",
          },
          failure: {
            DEFAULT: "var(--color-accent-drop, #EF4444)",
            muted: "var(--color-accent-drop-muted, rgba(239, 68, 68, 0.15))",
          },
          rest: {
            DEFAULT: "var(--color-accent-rest, #8B5CF6)",
            muted: "var(--color-accent-rest-muted, rgba(139, 92, 246, 0.15))",
          },
          cyan: {
            DEFAULT: "var(--color-accent-cyan, #06B6D4)",
            muted: "var(--color-accent-cyan-muted, rgba(6, 182, 212, 0.15))",
          },
        },
        pr: {
          DEFAULT: "var(--color-accent-pr, #22C55E)",
          muted: "var(--color-accent-pr-muted, rgba(34, 197, 94, 0.15))",
        },
        warmup: {
          DEFAULT: "var(--color-accent-warmup, #F59E0B)",
          muted: "var(--color-accent-warmup-muted, rgba(245, 158, 11, 0.15))",
        },
        drop: {
          DEFAULT: "var(--color-accent-drop, #EF4444)",
          muted: "var(--color-accent-drop-muted, rgba(239, 68, 68, 0.15))",
        },
        rest: {
          DEFAULT: "var(--color-accent-rest, #8B5CF6)",
          muted: "var(--color-accent-rest-muted, rgba(139, 92, 246, 0.15))",
        },

        /* === TEXT & FOREGROUND HIERARCHY === */
        text: {
          primary: "var(--color-text-primary, #FFFFFF)",
          secondary: "var(--color-text-secondary, #A1A1AA)",
          muted: "var(--color-text-muted, #71717A)",
          disabled: "var(--color-text-disabled, #52525B)",
          inverse: "var(--color-text-inverse, #000000)",
        },
        foreground: {
          DEFAULT: "var(--color-text-primary, #FFFFFF)",
          secondary: "var(--color-text-secondary, #A1A1AA)",
          muted: "var(--color-text-muted, #71717A)",
          disabled: "var(--color-text-disabled, #52525B)",
        },

        /* === BORDERS & DIVIDERS === */
        border: {
          DEFAULT: "var(--color-border-subtle, #27272A)",
          subtle: "var(--color-border-subtle, #27272A)",
          medium: "var(--color-border-medium, #3F3F46)",
          strong: "var(--color-border-strong, #52525B)",
          focus: "var(--color-border-focus, #007AFF)",
          error: "var(--color-border-error, #EF4444)",
        },
      },

      /* === SPACING SCALE (PADDING & MARGIN) === */
      spacing: {
        none: "var(--space-none, 0px)",
        "3xs": "var(--space-3xs, 2px)",
        "2xs": "var(--space-2xs, 4px)",
        xs: "var(--space-xs, 6px)",
        sm: "var(--space-sm, 8px)",
        md: "var(--space-md, 12px)",
        lg: "var(--space-lg, 16px)",
        xl: "var(--space-xl, 20px)",
        "2xl": "var(--space-2xl, 24px)",
        "3xl": "var(--space-3xl, 32px)",
        "4xl": "var(--space-4xl, 40px)",
        "5xl": "var(--space-5xl, 48px)",
        "6xl": "var(--space-6xl, 64px)",
      },

      /* === BORDER RADIUS SCALE === */
      borderRadius: {
        none: "var(--radius-none, 0px)",
        xs: "var(--radius-xs, 4px)",
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 8px)",
        lg: "var(--radius-lg, 12px)",
        xl: "var(--radius-xl, 16px)",
        "2xl": "var(--radius-2xl, 20px)",
        "3xl": "var(--radius-3xl, 24px)",
        full: "var(--radius-full, 9999px)",
      },
    },
  },
  plugins: [],
};
