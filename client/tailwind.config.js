/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        "3xl": "1600px",
        "4xl": "1920px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "bounce-in": "bounceIn 0.6s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        large:
          "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.04)",
      },
      backdropBlur: {
        xs: "2px",
      },
      // Enhanced responsive utilities
      fontSize: {
        "responsive-xs": [
          "clamp(0.75rem, 2vw, 0.875rem)",
          { lineHeight: "1.4" },
        ],
        "responsive-sm": [
          "clamp(0.875rem, 2.5vw, 1rem)",
          { lineHeight: "1.5" },
        ],
        "responsive-base": [
          "clamp(1rem, 3vw, 1.125rem)",
          { lineHeight: "1.6" },
        ],
        "responsive-lg": [
          "clamp(1.125rem, 4vw, 1.25rem)",
          { lineHeight: "1.5" },
        ],
        "responsive-xl": ["clamp(1.25rem, 5vw, 1.5rem)", { lineHeight: "1.4" }],
        "responsive-2xl": ["clamp(1.5rem, 6vw, 2rem)", { lineHeight: "1.3" }],
        "responsive-3xl": ["clamp(2rem, 8vw, 3rem)", { lineHeight: "1.2" }],
        "responsive-4xl": ["clamp(2.5rem, 10vw, 4rem)", { lineHeight: "1.1" }],
        "responsive-5xl": ["clamp(3rem, 12vw, 5rem)", { lineHeight: "1" }],
      },
      // Responsive spacing
      spacing: {
        "responsive-xs": "clamp(0.25rem, 1vw, 0.5rem)",
        "responsive-sm": "clamp(0.5rem, 2vw, 1rem)",
        "responsive-md": "clamp(1rem, 4vw, 2rem)",
        "responsive-lg": "clamp(1.5rem, 6vw, 3rem)",
        "responsive-xl": "clamp(2rem, 8vw, 4rem)",
        "responsive-2xl": "clamp(3rem, 10vw, 6rem)",
      },
      // Responsive container
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },
    },
  },
  plugins: [
    // Custom plugin for responsive utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".text-responsive": {
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          lineHeight: "1.5",
        },
        ".text-responsive-lg": {
          fontSize: "clamp(1.5rem, 4vw, 3rem)",
          lineHeight: "1.2",
        },
        ".text-responsive-xl": {
          fontSize: "clamp(2rem, 6vw, 4rem)",
          lineHeight: "1.1",
        },
        ".responsive-padding": {
          padding: "clamp(1rem, 4vw, 2rem)",
        },
        ".responsive-margin": {
          margin: "clamp(1rem, 4vw, 2rem)",
        },
        ".touch-target": {
          minHeight: "44px",
          minWidth: "44px",
        },
        ".aspect-video": {
          aspectRatio: "16 / 9",
        },
        ".aspect-square": {
          aspectRatio: "1 / 1",
        },
        ".aspect-portrait": {
          aspectRatio: "3 / 4",
        },
        ".aspect-landscape": {
          aspectRatio: "4 / 3",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
