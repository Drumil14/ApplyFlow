import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// --- Mock Upstash so no real Redis call is ever made in the suite. ---
// vi.mock factories are hoisted above imports, so shared mock fns must live in
// vi.hoisted (also hoisted) to be referenceable inside the factories.
const { limitMock, RedisCtor, fixedWindowMock, RatelimitCtor, getServerSessionMock } = vi.hoisted(
  () => {
    const limitMock = vi.fn();
    return {
      limitMock,
      RedisCtor: vi.fn().mockImplementation(() => ({})),
      fixedWindowMock: vi.fn().mockReturnValue("fixed-window-limiter"),
      RatelimitCtor: vi.fn().mockImplementation(() => ({ limit: limitMock })),
      getServerSessionMock: vi.fn()
    };
  }
);

vi.mock("@upstash/redis", () => ({ Redis: RedisCtor }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(RatelimitCtor, { fixedWindow: fixedWindowMock })
}));

// --- Mock the auth/session chain so the identifier test doesn't hit prisma. ---
vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/demo", () => ({ ensureDemoUser: vi.fn() }));

import { checkAIAnalysisLimit } from "@/lib/rate-limit";
import { getRateLimitIdentifier } from "@/lib/session";

const CONFIG = {
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "test-token"
};

beforeEach(() => {
  limitMock.mockReset();
  RatelimitCtor.mockClear();
  getServerSessionMock.mockReset();
  process.env.UPSTASH_REDIS_REST_URL = CONFIG.UPSTASH_REDIS_REST_URL;
  process.env.UPSTASH_REDIS_REST_TOKEN = CONFIG.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("checkAIAnalysisLimit", () => {
  it("allows a request under the limit and returns metadata", async () => {
    limitMock.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 123 });

    const result = await checkAIAnalysisLimit("user:alice");

    expect(result).toEqual({ status: "ok", limit: 5, remaining: 4, reset: 123 });
    expect(limitMock).toHaveBeenCalledTimes(1);
  });

  it("reports rate_limited when the window is exhausted", async () => {
    limitMock.mockResolvedValue({ success: false, limit: 5, remaining: 0, reset: 999 });

    const result = await checkAIAnalysisLimit("user:alice");

    expect(result).toEqual({ status: "rate_limited", limit: 5, remaining: 0, reset: 999 });
  });

  it("fails closed as unavailable when Upstash config is missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await checkAIAnalysisLimit("user:alice");

    expect(result).toEqual({ status: "unavailable" });
    expect(limitMock).not.toHaveBeenCalled();
  });

  it("fails closed as unavailable when Redis throws", async () => {
    limitMock.mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await checkAIAnalysisLimit("user:alice");

    expect(result).toEqual({ status: "unavailable" });
  });

  it("hashes the identifier before using it as a Redis key", async () => {
    limitMock.mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: 1 });

    await checkAIAnalysisLimit("ip:203.0.113.7");

    const passed = limitMock.mock.calls[0][0] as string;
    // Never the raw identifier; a fixed-length lowercase hex digest instead.
    expect(passed).not.toBe("ip:203.0.113.7");
    expect(passed).not.toContain("203.0.113.7");
    expect(passed).toMatch(/^[a-f0-9]{40}$/);
  });
});

describe("getRateLimitIdentifier", () => {
  function req(headers: Record<string, string> = {}): Request {
    return new Request("https://applyflow.test/api/analyze", { headers });
  }

  it("prefers the authenticated user id when a real session exists", async () => {
    getServerSessionMock.mockResolvedValue({ user: { id: "usr_123" } });

    const id = await getRateLimitIdentifier(req({ "x-forwarded-for": "203.0.113.7" }));

    expect(id).toBe("user:usr_123");
  });

  it("falls back to the first valid IP in x-forwarded-for", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const id = await getRateLimitIdentifier(
      req({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" })
    );

    expect(id).toBe("ip:203.0.113.7");
  });

  it("skips a garbage x-forwarded-for entry and uses the next valid IP", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const id = await getRateLimitIdentifier(req({ "x-forwarded-for": "unknown, 70.41.3.18" }));

    expect(id).toBe("ip:70.41.3.18");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const id = await getRateLimitIdentifier(req({ "x-real-ip": "198.51.100.9" }));

    expect(id).toBe("ip:198.51.100.9");
  });

  it("uses an 'unknown' bucket when no IP can be derived", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const id = await getRateLimitIdentifier(req());

    expect(id).toBe("ip:unknown");
  });
});
