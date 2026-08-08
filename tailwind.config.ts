import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: "#98a086",
        sagedeep: "#6f7a5f",
        rose: "#a76d5e",
        rosedeep: "#8a4a3b",
        tan: "#c4a071",
        beige: "#dfccb1",
        terra: "#846044",
        surround: "#cdbb9a",
        paper: "#eaddbe",
        paper2: "#dbc8a7",
        card: "#f4ecdb",
        input: "#e6d8bd",
        ink: "#3a2c22",
        inksoft: "#5c4838",
        inksoft2: "#4a3a2c",
        accent: "#846044",
        accentdark: "#5f4530",
        dark: "#3a2b1f",
        crema: "#c4a071",
        mono: "#8a7660",
        monolight: "#a08c72",
      },
      fontFamily: {
        disp: ["var(--f-disp)", "Georgia", "serif"],
        body: ["var(--f-body)", "Georgia", "serif"],
        hand: ["var(--f-hand)", "cursive"],
        mono: ["var(--f-mono)", "monospace"],
      },
      borderRadius: { pill: "999px" },
    },
  },
  plugins: [],
};
export default config;
