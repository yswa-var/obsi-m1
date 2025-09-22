import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "YSWA",
    pageTitleSuffix: " - Blogs",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: {
          name: "Funnel Sans",
          weights: [400, 600, 700],
          includeItalic: true
        },
        body: {
          name: "Funnel Sans",
          weights: [300, 400, 500, 600],
          includeItalic: true
        },
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#ffffff", // GitHub Light background
          lightgray: "#f6f8fa", // GitHub Light secondary background
          gray: "#656d76", // GitHub Light muted text
          darkgray: "#24292f", // GitHub Light primary text
          dark: "#24292f", // GitHub Light dark text
          secondary: "#0969da", // GitHub Light primary blue
          tertiary: "#656d76", // GitHub Light tertiary text
          highlight: "rgba(9, 105, 218, 0.1)", // GitHub Light blue highlight
          textHighlight: "#fff8c5", // GitHub Light text highlight (yellow)
        },
        darkMode: {
          light: "#0d1117", // GitHub Dark background
          lightgray: "#161b22", // GitHub Dark secondary background
          gray: "#7d8590", // GitHub Dark muted text
          darkgray: "#f0f6fc", // GitHub Dark primary text
          dark: "#f0f6fc", // GitHub Dark light text
          secondary: "#58a6ff", // GitHub Dark primary blue
          tertiary: "#7d8590", // GitHub Dark tertiary text
          highlight: "rgba(88, 166, 255, 0.15)", // GitHub Dark blue highlight
          textHighlight: "#ffd33d44", // GitHub Dark text highlight
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
