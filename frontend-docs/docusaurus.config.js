// @ts-check

const config = {
  title: "BigWork Frontend Guide",
  tagline: "Frontend integration handbook for bigwork-backend",

  url: "https://example.com",
  baseUrl: "/frontend-guide/",

  organizationName: "team",
  projectName: "bigwork-frontend-docs",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "th",
    locales: ["th"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
        },
        blog: false,
        pages: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: "BigWork Frontend Guide",
      items: [
        {
          type: "docSidebar",
          sidebarId: "guideSidebar",
          position: "left",
          label: "คู่มือ",
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
  },
};

module.exports = config;
