import { Elysia } from "elysia";
import { html } from "@elysiajs/html"
import * as elements from "typed-html"
import { db } from "./db"
import { Pokemon, pokemons } from "./db/schema"
import { eq } from "drizzle-orm";

const pokemonTypeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  dark: "#705746",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  fairy: "#D685AD",
  steel: "#B7B7CE",
  dragon: "#6F35FC"
}

const app = new Elysia()
  .use(html())
  .get("/",
    async () => {
      const data = await db.select().from(pokemons).limit(1)
      return (
        <BaseHtml >
          <body class="w-full min-h-screen bg-stone-900 p-4">
            <NavBar />
            <main class="flex flex-col w-full h-full justify-center items-center py-52">
              <div class="relative ">
                <Pokemon pokemon={data[0]} />
                <a class="absolute top-1/2 -translate-y-1/2 -right-16 text-white border rounded px-2" href={`/pokemon/${2}`}>Next</a>
              </div>
            </main>
          </body>
        </BaseHtml >
      )
    }
  )
  .get("/savePokemon/:pokeId",
    async ({ params: { pokeId } }) => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`)
      const data = await res.json()
      const { id, name, types, sprites } = data
      const frontSprite = sprites.front_default
      const pokeTypes: string[] = []
      types.map((type: pokeType) => pokeTypes.push(type.type.name))
      const newPokemon = await db.insert(pokemons)
        .values({ id: id, name: name, sprite: frontSprite, types: pokeTypes })
        .returning()
        .get()
      return newPokemon
    })
  .get("/allPokemon", async () => {
    const data = await db.select().from(pokemons).all()
    return (
      <BaseHtml>
        <div class="min-h-screen bg-stone-900 p-4">
          <NavBar />
          <main class="flex justify-center items-center">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {data.map(pokemon => (
                <PokemonGridItem pokemon={pokemon} />
              ))}
            </div>
          </main>
        </div>
      </BaseHtml>
    )
  })
  .get("/pokemon/:pokeId",
    async ({ params: { pokeId } }) => {
      let convertedPokemonId = parseInt(pokeId)
      const data = await db.select().from(pokemons).where(eq(pokemons.id, convertedPokemonId)).get()
      if (!data) {
        return (
          <BaseHtml>
            <h1>Can't find no pokemon... Dawg</h1>
          </BaseHtml>
        )
      }

      return (
        <BaseHtml>
          <div class="min-h-screen bg-stone-900 p-4">
            <NavBar />
            <main
              class="flex flex-col w-full h-full justify-center items-center py-52"
              hx-boost="true"
              hx-ext="preload"
            >
              <div class="relative">
                <PrevBtn decrementPokemonId={convertedPokemonId} />
                <Pokemon pokemon={data} />
                <NextBtn incrementPokemonId={convertedPokemonId} />
              </div>
            </main>
          </div>
        </BaseHtml>
      )
    })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

type pokeType = {
  type: {
    name: string
  }
}

const BaseHtml = ({ children }: elements.Children) => `
          <!DOCTYPE html>
          <html lang="en">

            <head>
              <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="https://unpkg.com/htmx.org@1.9.5" integrity="sha384-xcuj3WpfgjlKF+FXhSQFQ0ZNr39ln+hwjN3npfM9VBnUskLolQAcN80McRIVOPuO" crossorigin="anonymous"></script>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <title>Pokedex</title>
                  <script src="https://unpkg.com/htmx.org/dist/ext/preload.js"></script>
                  <script>
                      htmx.config.globalViewTransitions = true;
                  </script>
                </head>
                ${children}
                `


function PokemonGridItem({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div class="flex flex-col items-center text-white border rounded p-4">
      <h1 class="text-lg uppercase">{pokemon.name}</h1>
      <p>Pokedex Nr:{pokemon.id}</p>
      <img
        src={pokemon.sprite}
        alt="not found"
        width="200"
        height="200"
        style="image-rendering: pixelated"
      />
      <div class="flex gap-2">
        {
          //@ts-ignore
          pokemon.types.map(type => (
            <p class="text-lg uppercase">{type}</p>
          ))}
      </div>
    </div>
  )
}

function Pokemon({ pokemon }: { pokemon: Pokemon }) {
  function getColor(color: string) {
    //@ts-ignore
    return `${pokemonTypeColors[color]}`
  }

  return (
    <div class="flex flex-col items-center text-black rounded p-4 transition-all ease-in bg-gradient-to-b from-stone-200 to-stone-900">
      <h1 class="text-lg uppercase">{pokemon.name}</h1>
      <p>Pokedex Nr:{pokemon.id}</p>
      <img
        src={pokemon.sprite}
        alt="not found"
        width="400"
        height="400"
        style="image-rendering: pixelated"
      />
      <div class="flex gap-2">
        {
          //@ts-ignore
          pokemon.types.map((type: string) => (
            <p 
            class="text-lg uppercase rounded px-3"
            style={`background-color: ${getColor(type)}`}
            >{type}</p>
          ))}
      </div>
    </div>
  )
}

function NavBar() {
  return (
    <nav class="sticky top-0 left-0 flex justify-between items-center w-full backdrop-blur-sm p-4">
      <a class="text-white" href="/">Home</a>
      <a class="text-white" href="/allPokemon">All Pokemon</a>
    </nav>
  )
}

function PrevBtn({ decrementPokemonId }: { decrementPokemonId: number }) {
  let display: boolean
  if (decrementPokemonId > 1) {
    display = true
    decrementPokemonId--
  } else {
    display = false
  }
  return (
    <a
      class={`absolute top-1/2 -translate-y-1/2 -left-16 text-white text-lg border rounded px-2 hover:bg-stone-200 hover:text-black ${display ? "visible" : "invisible"}`}
      href={`/pokemon/${decrementPokemonId}`}
      preload="mouseover"
    >
      Prev
    </a>
  )
}

function NextBtn({ incrementPokemonId }: { incrementPokemonId: number }) {
  let display: boolean
  if (incrementPokemonId < 151) {
    display = true
    incrementPokemonId++
  } else {
    display = false
  }
  return (
    <a
      class={`absolute top-1/2 -translate-y-1/2 -right-16 text-white text-lg border rounded px-2 hover:bg-stone-200 hover:text-black ${display ? "visible" : "invisible"}`}
      href={`/pokemon/${incrementPokemonId}`}
      preload="mouseover"
    >
      Next
    </a>
  )
}
