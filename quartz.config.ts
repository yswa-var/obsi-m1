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
          light: "#eff1f5", // Catppuccin Latte Base
          lightgray: "#ccd0da", // Catppuccin Latte Surface 0
          gray: "#9ca0b0", // Catppuccin Latte Overlay 0
          darkgray: "#4c4f69", // Catppuccin Latte Text
          dark: "#1e1e2e", // Catppuccin Mocha Base
          secondary: "#89b4fa", // Catppuccin Mocha Blue
          tertiary: "#6c7086", // Catppuccin Mocha Overlay 0
          highlight: "rgba(137, 180, 250, 0.1)", // Catppuccin Mocha Blue with transparency
          textHighlight: "#89b4fa44", // Catppuccin Mocha Blue with transparency
        },
        darkMode: {
          light: "#1e1e2e", // Catppuccin Mocha Base
          lightgray: "#313244", // Catppuccin Mocha Surface 0
          gray: "#6c7086", // Catppuccin Mocha Overlay 0
          darkgray: "#cdd6f4", // Catppuccin Mocha Text
          dark: "#f9fafb", // Light text for dark backgrounds
          secondary: "#89b4fa", // Catppuccin Mocha Blue
          tertiary: "#6c7086", // Catppuccin Mocha Overlay 0
          highlight: "rgba(137, 180, 250, 0.15)", // Catppuccin Mocha Blue with transparency
          textHighlight: "#89b4fa55", // Catppuccin Mocha Blue with transparency
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
