import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/typography')]
} satisfies Config;
