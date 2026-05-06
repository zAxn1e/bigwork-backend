module.exports = {
  guideSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      items: [
        "getting-started/setup",
        "getting-started/project-structure",
      ],
    },
    {
      type: "category",
      label: "Integration",
      items: [
        "integration/env-and-http-client",
        "integration/auth-and-session",
        "integration/profile-and-media",
        "integration/api-key-and-security",
      ],
    },
    {
      type: "category",
      label: "Implementation",
      items: [
        "implementation/pages-and-flows",
        "implementation/ui-blueprint",
        "implementation/state-and-data-fetching",
      ],
    },
    {
      type: "category",
      label: "Quality",
      items: [
        "quality/testing-checklist",
        "quality/troubleshooting",
      ],
    },
  ],
};
