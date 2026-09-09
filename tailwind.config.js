const { COLORS } = require("./src/constants/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: COLORS,
      // React Native does not synthesise weights from a custom family, so each
      // weight is its own family. Names are prefixed rather than called
      // font-semibold / font-bold, which would collide with Tailwind's built-in
      // fontWeight utilities of the same name.
      fontFamily: {
        sans: ["SunghyunSans-Regular"],
        "sans-semibold": ["SunghyunSans-SemiBold"],
        "sans-bold": ["SunghyunSans-Bold"],
      },
    },
  },
  plugins: [],
};
