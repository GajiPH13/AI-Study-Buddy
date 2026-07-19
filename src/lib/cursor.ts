import { ObjectId } from "mongodb";

type CursorValue = { date: string; id: string };

export function encodeCursor(date: Date, id: ObjectId) {
  return Buffer.from(JSON.stringify({ date: date.toISOString(), id: id.toHexString() } satisfies CursorValue)).toString("base64url");
}

export function decodeCursor(value: string): { date: Date; id: ObjectId } | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as CursorValue;
    const date = new Date(parsed.date);
    if (Number.isNaN(date.getTime()) || !ObjectId.isValid(parsed.id)) return null;
    return { date, id: new ObjectId(parsed.id) };
  } catch {
    return null;
  }
}
