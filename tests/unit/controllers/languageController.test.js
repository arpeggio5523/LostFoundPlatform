import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { buildTestApp } from "../../utils/buildTestApp.js";

const { detectMock, translateMock } = vi.hoisted(() => ({
  detectMock: vi.fn(),
  translateMock: vi.fn(),
}));

vi.mock("../../../src/services/laraTranslate.js", () => ({
  detectLanguage: detectMock,
  translateToEnglish: translateMock,
}));

const { detectQueryLanguage, translateQueryToEnglish } = await import(
  "../../../src/controllers/languageController.js"
);

const buildApp = () =>
  buildTestApp((app) => {
    app.post("/api/language/detect", detectQueryLanguage);
    app.post("/api/language/translate", translateQueryToEnglish);
  });

describe("language controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns detected language and confidence", async () => {
    detectMock.mockResolvedValue({ language: "zh", confidence: 0.99 });

    const response = await request(buildApp())
      .post("/api/language/detect")
      .send({ text: "手机" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ language: "zh", confidence: 0.99 });
    expect(detectMock).toHaveBeenCalledWith("手机");
  });

  it("translates a query to English", async () => {
    translateMock.mockResolvedValue("lost wallet");

    const response = await request(buildApp())
      .post("/api/language/translate")
      .send({ text: "dompet hilang" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ translatedText: "lost wallet" });
    expect(translateMock).toHaveBeenCalledWith("dompet hilang");
  });

  it("rejects missing or short text", async () => {
    const response = await request(buildApp())
      .post("/api/language/translate")
      .send({ text: "a" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/at least 2 characters/i);
    expect(translateMock).not.toHaveBeenCalled();
  });

  it("rejects text over the maximum length", async () => {
    const response = await request(buildApp())
      .post("/api/language/detect")
      .send({ text: "a".repeat(501) });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/500 characters/i);
    expect(detectMock).not.toHaveBeenCalled();
  });

  it("maps Lara rate limits to HTTP 429", async () => {
    const error = new Error("Too many requests");
    error.statusCode = 429;
    translateMock.mockRejectedValue(error);

    const response = await request(buildApp())
      .post("/api/language/translate")
      .send({ text: "lost phone" });

    expect(response.status).toBe(429);
    expect(response.body.error).toMatch(/temporarily unavailable/i);
  });
});
