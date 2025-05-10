import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileMenuToggle } from "./MobileMenuToggle";

describe("MobileMenuToggle Component", () => {
  beforeEach(() => {
    // Create a mock sidebar element
    const sidebar = document.createElement("aside");
    sidebar.classList.add("test-sidebar");
    document.body.appendChild(sidebar);
  });

  it("renders menu icon by default", () => {
    const { getByRole } = render(<MobileMenuToggle />);
    const button = getByRole("button");
    expect(button).toBeInTheDocument();
    // Check that the menu icon is present (not the X)
    const svg = button.querySelector("svg");
    expect(svg).toHaveClass("lucide-menu");
    expect(svg).toHaveClass("w-6");
    expect(svg).toHaveClass("h-6");
  });

  it("renders close icon when variant is close", () => {
    const { getByRole } = render(<MobileMenuToggle variant="close" />);
    const button = getByRole("button");
    expect(button).toBeInTheDocument();
    // Check that the X icon is present
    const svg = button.querySelector("svg");
    expect(svg).toHaveClass("lucide-x");
    expect(svg).toHaveClass("w-6");
    expect(svg).toHaveClass("h-6");
  });

  it("toggles sidebar visibility when clicked", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<MobileMenuToggle />);
    const button = getByRole("button");
    const sidebar = document.querySelector("aside");

    // Initially the sidebar should not have the -translate-x-full class
    expect(sidebar).not.toHaveClass("-translate-x-full");

    // Click the button to toggle sidebar
    await user.click(button);
    expect(sidebar).toHaveClass("-translate-x-full");

    // Click again to toggle back
    await user.click(button);
    expect(sidebar).not.toHaveClass("-translate-x-full");
  });
});
