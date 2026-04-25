import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
      backgroundImage: {
        'gradient-sunset': 'var(--gradient-sunset)',
        'gradient-card': 'var(--gradient-card)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.8", filter: "brightness(1.2)" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "vs-flash": {
          "0%": { opacity: "0", transform: "scale(0.3) rotate(-15deg)" },
          "60%": { opacity: "1", transform: "scale(1.3) rotate(3deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "card-enter-left": {
          "0%": { opacity: "0", transform: "translateX(-80px) scale(0.8)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "card-enter-right": {
          "0%": { opacity: "0", transform: "translateX(80px) scale(0.8)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "damage-pop": {
          "0%": { opacity: "0", transform: "scale(0.4) rotate(-8deg)" },
          "55%": { opacity: "1", transform: "scale(1.25) rotate(4deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-2deg)" },
        },
        "victory-pulse": {
          "0%, 100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.5)" },
        },
        "bg-particle": {
          "0%": { transform: "translateY(100vh) translateX(0px)", opacity: "0" },
          "10%": { opacity: "0.6" },
          "90%": { opacity: "0.4" },
          "100%": { transform: "translateY(-10vh) translateX(20px)", opacity: "0" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        "hp-drain": {
          "0%": { width: "100%" },
          "100%": { width: "var(--hp-pct)" },
        },
        "grid-glow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "vs-flash": "vs-flash 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "card-enter-left": "card-enter-left 0.4s ease-out forwards",
        "card-enter-right": "card-enter-right 0.4s ease-out forwards",
        "damage-pop": "damage-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "victory-pulse": "victory-pulse 0.8s ease-in-out infinite",
        "bg-particle": "bg-particle 8s linear infinite",
        "scanline": "scanline 6s linear infinite",
        "grid-glow": "grid-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
