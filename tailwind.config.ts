import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#ffffff",
      },
      animation: {
        blob: 'blob 20s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 3s infinite ease-in-out',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -30px) scale(1.05)' },
          '50%': { transform: 'translate(-15px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(25px, 15px) scale(1.02)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(147, 51, 234, 0.5)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
