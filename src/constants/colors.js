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
  "circle-avatar-background": "#D9F0FF",
  "circle-avatar": "#48B8F2",
  "circle-name": "#555555",
  "circle-member-blue": "#C9EDFF",
  "circle-member-yellow": "#FFF0C4",
  "circle-member-name": "#4A4A4A",
  "circle-invite": "#C5C5C5",
};

module.exports = { COLORS };
