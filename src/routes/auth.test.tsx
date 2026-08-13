import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({ error: null }),
      signUp: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [] }) }),
    }),
  },
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: { auth: { signInWithOAuth: async () => ({ error: null, redirected: false }) } },
}));

const { AuthRoute } = await import("./auth");
const { AuthProvider } = await import("@/hooks/useAuth");

function renderAuthRoute() {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth",
    validateSearch: () => ({ redirect: undefined as string | undefined }),
    component: AuthRoute,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([authRoute]),
    history: createMemoryHistory({ initialEntries: ["/auth"] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <RouterProvider router={router as any} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("/auth", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders the sign-in form without throwing a useAuth provider error", async () => {
    renderAuthRoute();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /welcome back/i })).toBeDefined();
    });
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });
});
