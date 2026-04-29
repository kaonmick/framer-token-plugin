/** @type {import("@ladle/react").UserConfig} */
const config = {
  stories: "src/story/**/*.stories.tsx",
  viteConfig: ".ladle/vite.config.ts",
  port: 61000,
  outDir: "dist-ladle",
  addons: {
    a11y: {
      enabled: true,
    },
    width: {
      enabled: true,
      options: {
        plugin: 420,
        mobile: 390,
        tablet: 768,
        desktop: 1024,
      },
      defaultState: 420,
    },
  },
}

export default config
