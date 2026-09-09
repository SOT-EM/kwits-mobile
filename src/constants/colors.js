/**
 * Single source of truth for the palette.
 *
 * Consumed by tailwind.config.js so NativeWind exposes it as classes
 * (bg-input, text-muted, ...), and imported directly in the few places that
 * need a raw value -- Reanimated animated styles and ActivityIndicator cannot
 * take a className.
 */
const COLORS = {
  background: "#FFFFFF",
  foreground: "#111111",
  muted: "#8E8E93",
  accent: "#6C5CE7",
  danger: "#F04438",
  primary: "#1C1C1E",
  "on-primary": "#FFFFFF",
  input: "#F3F3F3",
  "tab-bar": "#F3F3F3",
  hairline: "#D4D4D4",
  skeleton: "#D9D9D9",
  "dot-inactive": "#DDDDDD",
};

module.exports = { COLORS };
