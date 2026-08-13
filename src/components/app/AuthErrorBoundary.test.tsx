import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthErrorBoundary } from "./AuthErrorBoundary";

vi.mock("@/lib/lovable-error-reporting", () => ({
  reportLovableError: vi.fn(),
}));

function Boom(): never {
  throw new Error("AuthProvider failed to initialise");
}

describe("AuthErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders the fallback UI instead of a blank page when auth throws", () => {
    const { container } = render(
      <AuthErrorBoundary>
        <Boom />
      </AuthErrorBoundary>,
    );

    expect(screen.getByRole("heading", { name: /sign-in is unavailable/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /try again/i })).toBeDefined();
    expect(container.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("reports the error", async () => {
    const { reportLovableError } = await import("@/lib/lovable-error-reporting");
    render(
      <AuthErrorBoundary>
        <Boom />
      </AuthErrorBoundary>,
    );
    expect(reportLovableError).toHaveBeenCalled();
  });

  it("renders children when nothing throws", () => {
    render(
      <AuthErrorBoundary>
        <p>All good</p>
      </AuthErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeDefined();
  });
});
