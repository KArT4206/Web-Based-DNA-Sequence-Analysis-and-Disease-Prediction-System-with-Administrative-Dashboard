// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbff",
          100: "#e6f5ff",
          300: "#7cc0ff",
          500: "#3b82f6",
          700: "#1e40af",
        },
      },
    },
  },
  plugins: [],
};
