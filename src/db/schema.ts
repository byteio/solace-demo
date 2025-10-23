import { sql, type SQL } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  bigint,
  customType,
  index,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    searchTsv: tsvector("search_tsv")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
          setweight(to_tsvector('english', ${advocates.firstName}), 'B') ||
          setweight(to_tsvector('english', ${advocates.lastName}),  'B') ||
          setweight(to_tsvector('english', ${advocates.city}),       'A') ||
          setweight(to_tsvector('english', ${advocates.degree}),     'C') ||
          setweight(to_tsvector('english', coalesce((${advocates.specialties})::text, '')), 'A')
        `,
      ),
  },
  (t) => ({
    idx: index("advocates_search_idx").using("gin", t.searchTsv),
  }),
);

export { advocates };
