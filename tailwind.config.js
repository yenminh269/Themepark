export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#F8FAF8",     // soft ivory white
          base: "#CFE3D3",      // pale sage
          accent: "#8FB996",    // soft green accent
          dark: "#2F4F4F",      // deep green-gray
          border: "#DDE5D9",    // light border
          text: "#384B3A",      // muted deep text
        },
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.05)",
        card: "0 8px 24px rgba(0,0,0,0.06)",
      },
      backdropBlur: {
        glass: "12px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
