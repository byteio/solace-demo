import { eq, sql } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import type { NextRequest } from "next/server";

const extractPhoneNumber = (query: string | null): string | null => {
  if (!query) return null;
  const trimmed = query.trim();
  const phonePattern = /^[\d\s\-()]+$/;
  if (!phonePattern.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q");
  const query = rawQuery?.trim();

  if (!query) {
    const data = await db.select().from(advocates).limit(50);
    return Response.json({ data });
  }

  const phoneDigits = extractPhoneNumber(query);

  if (phoneDigits) {
    const data = await db
      .select()
      .from(advocates)
      .where(eq(advocates.phoneNumber, Number(phoneDigits)));
    return Response.json({ data });
  }

  const data = await db
    .select()
    .from(advocates)
    .where(
      sql`${advocates.searchTsv} @@ websearch_to_tsquery('english', ${query})`,
    )
    .limit(50);

  return Response.json({ data });
}
