import type { Preview } from "@storybook/nextjs";
import "../app/globals.css";

/**
 * A dark/light toolbar toggle that flips the `.light` class on <html> — the same
 * switch the app's ThemeToggle uses — so components can be reviewed in both
 * themes without leaving Storybook.
 */
const preview: Preview = {
  parameters: {
    layout: "centered"
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" }
        ],
        dynamicTitle: true
      }
    }
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("light", theme === "light");
      }
      return Story();
    }
  ]
};

export default preview;
