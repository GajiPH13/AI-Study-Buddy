import { describe, expect, it } from "vitest";
import { ObjectId } from "mongodb";
import { decodeCursor, encodeCursor } from "@/lib/cursor";

describe("pagination cursor", () => {
  it("round trips a date and object id", () => {
    const date = new Date("2026-07-19T12:00:00.000Z");
    const id = new ObjectId();
    const decoded = decodeCursor(encodeCursor(date, id));

    expect(decoded?.date).toEqual(date);
    expect(decoded?.id.equals(id)).toBe(true);
  });

  it("rejects malformed values", () => {
    expect(decodeCursor("not-a-cursor")).toBeNull();
  });
});
