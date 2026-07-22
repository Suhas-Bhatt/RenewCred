import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14151A",
        "ink-soft": "#1E1F27",
        paper: "#F6F5F2",
        canvas: "#FFFFFF",
        accent: {
          DEFAULT: "#4F46E5",
          soft: "#EEF0FE",
        },
        line: "#E4E2DC",
        ash: "#6B6D7A",
        success: "#15803D",
        warning: "#B45309",
        danger: "#B91C1C",
        block: {
          heading: "#4F46E5",
          paragraph: "#6B6D7A",
          image: "#0891B2",
          list: "#7C3AED",
          table: "#B45309",
          math: "#BE185D",
          code: "#15803D",
          quote: "#9333EA",
          divider: "#94A3B8",
          callout: "#0284C7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20,21,26,0.04), 0 1px 12px rgba(20,21,26,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
