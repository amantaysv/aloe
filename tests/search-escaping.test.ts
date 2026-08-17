import { describe, expect, it } from "vitest";
import { escapeLike } from "@/services/product.service";

describe("escapeLike", () => {
  // % and _ are LIKE wildcards and PostgREST additionally rewrites * to %, so an unescaped
  // term of "%" matched the entire catalogue: a full sequential scan plus an exact COUNT.
  it("neutralises wildcards so they match literally", () => {
    expect(escapeLike("%")).toBe("\\%");
    expect(escapeLike("_")).toBe("\\_");
    expect(escapeLike("50%")).toBe("50\\%");
    expect(escapeLike("a_b")).toBe("a\\_b");
  });

  it("strips *, which PostgREST would turn into %", () => {
    expect(escapeLike("*")).toBe("");
    expect(escapeLike("кре*м")).toBe("крем");
  });

  it("escapes the escape character itself", () => {
    expect(escapeLike("\\")).toBe("\\\\");
    // Ordering matters: escaping the backslash after % would double-escape it.
    expect(escapeLike("\\%")).toBe("\\\\\\%");
  });

  it("leaves ordinary search terms untouched", () => {
    expect(escapeLike("крем для рук")).toBe("крем для рук");
    expect(escapeLike("Nivea 250 мл")).toBe("Nivea 250 мл");
  });
});
