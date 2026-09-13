/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif-custom': ['"Playfair Display"', 'Georgia', 'serif'],
        'cursive-custom': ['"Great Vibes"', 'cursive'],
        'sans-custom': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
