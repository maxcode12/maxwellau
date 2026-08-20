import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("defaults to type=button so it cannot accidentally submit a form", () => {
    render(<Button>Book</Button>);
    expect(screen.getByRole("button", { name: "Book" })).toHaveAttribute("type", "button");
  });

  it("honours an explicit submit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("applies variant and size classes and merges a caller className", () => {
    render(
      <Button variant="outline" size="lg" className="mt-9">
        Listen
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Listen" });
    expect(button.className).toContain("mt-9");
    expect(button.className).toContain("border-gold-500/50");
  });

  it("exposes the disabled state to assistive technology", () => {
    render(<Button disabled>Sending</Button>);
    expect(screen.getByRole("button", { name: "Sending" })).toBeDisabled();
  });
});
