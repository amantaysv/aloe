import { describe, expect, it, vi } from "vitest";
import { resolveOrigin, safeRedirect } from "@/lib/safe-redirect";

const BASE = "https://aloe.kg";

describe("safeRedirect", () => {
  // These two were live open redirects: bare concatenation onto the origin made
  // `@evil.com` resolve to evil.com and `.evil.com` to aloe.kg.evil.com.
  it.each([
    ["@evil.com"],
    [".evil.com"],
    ["//evil.com"],
    ["/\\evil.com"],
    ["https://evil.com"],
    ["javascript:alert(1)"],
    ["\\\\evil.com"],
    [""],
    [null],
    [undefined],
  ])("keeps %j on our own host", (next) => {
    expect(safeRedirect(next, BASE).host).toBe("aloe.kg");
  });

  it("allows relative paths through, query string intact", () => {
    expect(safeRedirect("/profile", BASE).href).toBe("https://aloe.kg/profile");
    expect(safeRedirect("/catalog/kosmetika?sub=krem", BASE).href).toBe("https://aloe.kg/catalog/kosmetika?sub=krem");
  });

  it("falls back to the given path when next is unusable", () => {
    expect(safeRedirect("@evil.com", BASE).pathname).toBe("/auth");
    expect(safeRedirect(null, BASE, "/").pathname).toBe("/");
  });
});

describe("resolveOrigin", () => {
  it("uses the request origin when no forwarded host is present", () => {
    expect(resolveOrigin(null, "https://localhost:3000")).toBe("https://localhost:3000");
  });

  it("honours our own host and its subdomains", () => {
    expect(resolveOrigin("aloe.kg", "https://x")).toBe("https://aloe.kg");
    expect(resolveOrigin("www.aloe.kg", "https://x")).toBe("https://www.aloe.kg");
  });

  it("honours the deployment host only when the platform declares it", () => {
    expect(resolveOrigin("aloe-next.vercel.app", "https://x")).toBe("https://aloe.kg");

    vi.stubEnv("VERCEL_URL", "aloe-next.vercel.app");
    expect(resolveOrigin("aloe-next.vercel.app", "https://x")).toBe("https://aloe-next.vercel.app");
    vi.unstubAllEnvs();
  });

  it("rejects an attacker-supplied host", () => {
    expect(resolveOrigin("evil.com", "https://x")).toBe("https://aloe.kg");
    expect(resolveOrigin("aloe.kg.evil.com", "https://x")).toBe("https://aloe.kg");
    // A blanket *.vercel.app allowance used to let any attacker-owned deployment through.
    expect(resolveOrigin("attacker.vercel.app", "https://x")).toBe("https://aloe.kg");
    // Only the first entry of a comma-joined header is considered.
    expect(resolveOrigin("evil.com, aloe.kg", "https://x")).toBe("https://aloe.kg");
  });
});
