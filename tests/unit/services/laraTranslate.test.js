import { beforeEach, describe, expect, it, vi } from "vitest";

const { detectMock, translateMock, credentialsMock, translatorMock } = vi.hoisted(() => {
  const detectMock = vi.fn();
  const translateMock = vi.fn();
  const credentialsMock = vi.fn(function Credentials(id, secret) {
    this.id = id;
    this.secret = secret;
  });
  const translatorMock = vi.fn(function Translator() {
    this.detect = detectMock;
    this.translate = translateMock;
  });

  return { detectMock, translateMock, credentialsMock, translatorMock };
});

vi.mock("@translated/lara", () => ({
  Credentials: credentialsMock,
  Translator: translatorMock,
}));

const { detectLanguage, translateToEnglish, translateText } = await import(
  "../../../src/services/laraTranslate.js"
);

describe("laraTranslate service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LARA_ACCESS_KEY_ID = "test-access-key";
    process.env.LARA_ACCESS_KEY_SECRET = "test-access-secret";
  });

  it("detects the language and returns Lara confidence", async () => {
    detectMock.mockResolvedValue({
      language: "ms",
      contentType: "text/plain",
      predictions: [{ language: "ms", confidence: 0.98 }],
    });

    await expect(detectLanguage("telefon hilang")).resolves.toEqual({
      language: "ms",
      confidence: 0.98,
    });
    expect(detectMock).toHaveBeenCalledWith("telefon hilang");
  });

  it("translates with automatic source detection and English target", async () => {
    translateMock.mockResolvedValue({ translation: "lost phone" });

    await expect(translateToEnglish("telefon hilang")).resolves.toBe("lost phone");
    expect(translateMock).toHaveBeenCalledWith(
      "telefon hilang",
      undefined,
      "en",
      { noTrace: true }
    );
  });

  it("translates messages into the selected target language", async () => {
    translateMock.mockResolvedValue({ translation: "Helo" });
    await expect(translateText("Hello", "ms")).resolves.toBe("Helo");
    expect(translateMock).toHaveBeenCalledWith("Hello", undefined, "ms", { noTrace: true });
  });

  it("does not call Lara when credentials are missing", async () => {
    delete process.env.LARA_ACCESS_KEY_ID;
    delete process.env.LARA_ACCESS_KEY_SECRET;

    await expect(detectLanguage("hello")).rejects.toMatchObject({
      status: 503,
      message: "Lara Translate credentials are not configured.",
    });
    expect(detectMock).not.toHaveBeenCalled();
  });

  it("rejects an empty translation query before calling Lara", async () => {
    await expect(translateToEnglish("  ")).rejects.toThrow("Text is required.");
    expect(translateMock).not.toHaveBeenCalled();
  });

  it("rejects a detection response without a language", async () => {
    detectMock.mockResolvedValue({ predictions: [] });

    await expect(detectLanguage("hello")).rejects.toThrow(
      "Lara returned no detected language."
    );
  });
});
