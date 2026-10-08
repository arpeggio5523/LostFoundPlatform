import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalog } from "../../src/i18n/catalog";
import { createTranslator } from "../../src/i18n/translations";

describe("translation catalog", () => {
  it("has all three translations and matching interpolation placeholders for every entry", () => {
    const tokens = (value) => [...value.matchAll(/\{\{\w+\}\}/g)].map(([token]) => token).sort();
    for (const [key, values] of Object.entries(catalog)) {
      expect(values, key).toHaveLength(3);
      values.forEach((value) => {
        expect(value.trim().length, key).toBeGreaterThan(0);
        expect(tokens(value), key).toEqual(tokens(key));
      });
    }
  });

  it("covers every static translation key used by pages and components", () => {
    for (const directory of ["src/pages", "src/components"]) {
      for (const file of readdirSync(directory).filter((name) => name.endsWith(".jsx"))) {
        const source = readFileSync(`${directory}/${file}`, "utf8");
        for (const [literal] of source.matchAll(/\bt\("(?:[^"\\]|\\.)*"/g)) {
          const key = JSON.parse(literal.slice(2)).trim();
          expect(Object.hasOwn(catalog, key), `${file}: ${key}`).toBe(true);
        }
      }
    }
  });

  it("interpolates arbitrary user values literally, preserves spacing and falls back to English", () => {
    const t = createTranslator("zh");
    expect(t("By ")).toBe("发布者 ");
    expect(t("View details for {{title}}", { title: "<script>$&{{name}}</script>" })).toBe("查看 <script>$&{{name}}</script> 的详情");
    expect(t("An unknown future label")).toBe("An unknown future label");
    expect(createTranslator("en")("Settings")).toBe("Settings");
  });
});
