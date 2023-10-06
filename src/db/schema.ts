import { InferModel } from "drizzle-orm"
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core"

export const pokemons = sqliteTable("pokemon", {
  id: integer("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  sprite: text("sprite").notNull(),
  types: text("types", { mode: "json" }).notNull(),
})

export type Pokemon = InferModel<typeof pokemons>
