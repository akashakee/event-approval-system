/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7fb",
          100: "#e8eef7",
          500: "#2d5baf",
          700: "#1f3f7a",
          900: "#101f3d",
        },
      },
    },
  },
  plugins: [],
};
