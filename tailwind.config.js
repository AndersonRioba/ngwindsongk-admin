import { addDynamicIconSelectors } from "@iconify/tailwind"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // These resolve to CSS variables set by ThemeContext at runtime.
        // Fallback hex values are compiled in for SSR/no-JS environments.
        primary:   "var(--color-primary,   #6D31ED)",
        'primary-dark': "var(--color-primary-dark, #000000)",
        secondary: "var(--color-secondary, #15ABFF)",
        accent:    "var(--color-accent,    #15ABFF)",
        Success:   "var(--color-success,   #8fc5a1)",
        Warning:   "var(--color-warning,   #efb034)",
        Error:     "var(--color-error,     #df4247)",
      },
    },
  },
  plugins: [
    addDynamicIconSelectors(),
  ],
};

export default config;