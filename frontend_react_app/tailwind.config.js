/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // App theme tokens (light teal dashboard background + dark teal actions)
        bootcamp: {
          bg: "#ecfeff",
          panel: "#ffffff",
          ink: "#0f172a",
          muted: "#475569",
          tealDark: "#0f766e",
          teal: "#14b8a6",
          orange: "#f97316",
          green: "#16a34a"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
};
