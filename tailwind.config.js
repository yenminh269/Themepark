/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#EEF5FF", // lightest
          200: "#B4D4FF",
          300: "#86B6F6",
          800: "#176B87", // darkest
        },
      },
    },
  },
  plugins: [],
};
