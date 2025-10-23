import { eq, sql } from "drizzle-orm";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import type { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q");
  const query = rawQuery?.trim();

  if (!query) {
    const data = await db.select().from(advocates).limit(50);
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
