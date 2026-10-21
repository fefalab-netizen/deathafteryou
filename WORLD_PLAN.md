# Dead Lot — city world plan

Working design proposal, 19 October 2026. Setting chosen by the user: a dense city and surrounding suburbs. Names, dimensions, counts, and progression below are proposals, not implemented features.

## Core direction

Author the entire city's geography. Roads, blocks, building footprints, neighborhoods, bridges, major landmarks, and dungeon entrances stay in the same places in every playthrough. Procedural systems determine zombie populations and the layouts of designated small interiors. The player learns a real place while each new save presents different situations.

The city should make geographical sense before it becomes a combat map: residential streets feed commercial avenues, freight rail connects warehouses to industry, bridges connect both riverbanks, and hospitals and civic buildings sit on accessible major roads.

Keep the existing 160 × 160 district, tower entrance, Wrecker courtyard, and Dead Lot as the first authored anchor. The eight-floor tower is a signature location, not the standard size for procedural dungeons. Preserve the arena as an optional local encounter; its endless wave rules do not govern the whole city.

## Size and travel

Proposed planning envelope: 3,200 × 3,200 world units, with an irregular playable boundary formed by a river corridor, rail infrastructure, wooded suburban margins, and blocked outbound highways. This is 20 times the existing district's width and 400 times its bounding-box area. It is a long-term envelope, not a promise to fill every square with buildings.

At the current walking speed of 3.6 units/second, a straight 3,200-unit crossing takes about 14.8 minutes with no obstacles, fights, or stops. Actual street journeys take longer. Do not expand further until walking through a representative neighborhood feels good. Driving is a future decision, not a dependency for the first playable expansion.

Design targets to verify through later playtesting:

- A small discovery, route choice, or useful shelter every 30–60 seconds along interesting routes.
- A recognizable local destination within a few minutes of walking.
- Large open spaces only where they have a purpose: parks, rail yards, parking fields, river embankments.
- Regional danger changes gradually; crossing a district border never instantly changes nearby zombies.

## City structure

North is at the top. This is a conceptual placement diagram, not a road graph or a scale map. A north–south river divides the main city from the eastern districts.

```text
                         NORTH
       WEST / MAIN BANK                 EAST BANK
  ┌────────────┬─────────────┐       ┌──────────────────┐
  │ Northwood  │ University  │       │ Lakeside suburbs │
  │ suburbs    │ & hospital │       │ and estates      │
  ├────────────┼─────────────┤ RIVER ├──────────────────┤
  │ Westhaven  │ Civic core  │       │ Eastbank         │
  │ suburbs    │ & downtown  │       │ residential      │
  ├────────────┼─────────────┤       ├──────────────────┤
  │ Retail     │ Old Quarter│       │ Freight and      │
  │ belt       │ & station  │       │ industry         │
  ├────────────┼─────────────┤       ├──────────────────┤
  │ Southgate  │ Dead Lot / │       │ Utilities /      │
  │ housing    │ service belt│      │ highway approach │
  └────────────┴─────────────┘       └──────────────────┘
                         SOUTH
```

### District identities

Threat describes starting population and exposure, not character-level requirements. Suggested resources describe future incentives; inventory and resource systems do not exist yet.

| District | Spatial identity and fixed landmarks | Reason to visit | Starting threat | Small dungeon sites |
| --- | --- | --- | --- | --- |
| Dead Lot / service belt | Existing arena, tower, Wrecker courtyard; garages and workshops | Familiar starting anchor, repair supplies later | Low outdoors, dangerous named encounters | Workshop cellar, garage back rooms |
| Southgate housing | Compact houses, duplexes, school, local grocery, drainage lane | Early shelter and household supplies | Low–medium | Basements, small apartment buildings |
| Retail belt | Supermarket, hardware store, motel, broad parking areas and service alleys | Bulk supplies with exposed approaches | Medium, dense at shops | Stockrooms, motel wing, storage units |
| Westhaven suburbs | Curving residential streets, cul-de-sacs, church, neighborhood park | Base candidates and quieter travel | Low–medium, isolated clusters | House cellars, community-center basement |
| Northwood suburbs | Larger lots, wooded edges, water tower, maintenance depot | Alternate northern approach and secluded shelter | Low overall, limited escape routes in pockets | Maintenance rooms, hillside shelters |
| Old Quarter / station | Narrow streets, courtyards, mixed-use blocks, central rail station | Shortcuts and concentrated urban scavenging | High | Shop basements, tenements, station service rooms |
| Civic core / downtown | Office canyon, civic plaza, courthouse, multilevel parking | Major expeditions and memorable landmarks | Very high, uneven by block | Office annexes, parking sublevels, records rooms |
| University / hospital | Campus quads, teaching hospital, dormitories, service roads | Medical and specialist destinations | High, with quieter campus edges | Dorm wings, labs, clinic basements |
| Eastbank residential | Dense apartments, market street, river promenade, fire station | Eastern foothold and access to river crossings | Medium–high | Apartment wings, laundries, market storage |
| Lakeside suburbs / estates | Planned housing around an old reservoir lake, recreation center | Remote refuge options and long supply journeys | Low–medium, concentrated at recreation sites | Estate cellars, pool plant rooms |
| Freight / industry | Rail yard, loading courts, warehouses, foundry | Industrial equipment and valuable supplies | High in workplaces, sparse between yards | Warehouse offices, workshops, loading basements |
| Utilities / highway approach | Water treatment, substation, bus depot, jammed outbound highway | Infrastructure expeditions and world-story locations | Medium–high, heavy congestion pockets | Pump rooms, service tunnels, depot workshops |

Do not make whole neighborhoods safe or uniformly dangerous. A quiet residential block can border a crowded school; an empty downtown alley can offer a route around a packed plaza.

## Routes and fixed geography

Draw these before filling blocks with buildings:

1. **Main avenue:** Dead Lot → Old Quarter → downtown → university. Direct, readable, exposed.
2. **Western bypass:** Southgate → retail belt → Westhaven → Northwood → university. Longer, with more shelter and fewer major crowds.
3. **Eastern freight road:** utilities → industry → Eastbank → Lakeside. Wide roads with fenced yards and truck obstructions.
4. **Southern road bridge:** service belt ↔ utilities. Vehicle wrecks create cover and constrain movement.
5. **Central road bridge:** downtown ↔ Eastbank. Shortest major crossing, strong population pressure.
6. **Northern pedestrian bridge:** university ↔ Lakeside. Longer detour, narrow approaches, no vehicle access if driving arrives later.
7. **Rail corridor:** industry across a separate rail bridge to Old Quarter station. An additional risky crossing, not a required dungeon.

Each district needs at least two ways in or out. Each major destination gets a direct approach and a less obvious alternative. Main roads form loops; alleys and courtyards create local shortcuts. Optional small dungeons must never be the only connection between city districts.

The river and bridges create choices rather than a hard early/late-game split. No mandatory boss kill opens the entire eastern bank. Any temporary blockage must have an authored detour.

## Fixed versus procedural

| Fixed and authored | Procedural within authored limits |
| --- | --- |
| Terrain, riverbanks, bridges, street network | Initial zombie positions and group sizes |
| Blocks, building shells, entrances, street addresses | Zombie composition appropriate to the location |
| Major landmarks and signature encounter sites | Roaming groups and responses to noise |
| Dungeon locations, theme, footprint, access points | Eligible small-dungeon room arrangements |
| Landmark interiors and important routes | Furniture and obstruction variants that preserve access |
| District identity and intended density | Optional loot placement when inventory exists |

Use building kits to construct the authored city efficiently. Reusing walls, homes, and shop modules does not mean randomly placing the city's streets or landmarks. Ordinary interiors may be authored or use fixed templates; only designated dungeon sites need layout generation.

## Procedural zombie population

Give each block or site an authored population profile: baseline density, allowed zombie types, group-size range, indoor/outdoor weighting, spawn zones, and migration connections. Use site identity first: workers cluster around industry, residents around homes, crowds around stations and commercial centers. Brutes remain rare; the Wrecker remains a named encounter.

Generate the initial population from a saved world seed and stable site IDs. Separate random streams for population and dungeon layout so changing one does not reshuffle the other.

Materialize nearby zombies only at valid, unoccupied navigation positions outside the player's view and a configurable safety radius. Darkness alone must not allow enemies to appear beside the player. If no valid point exists, defer activation. Never place enemies inside walls, furniture, the player's occupied room, or an entrance arrival area.

Maintain three simulation levels:

- Nearby: individual enemies with full combat and movement.
- Surrounding area: coarse groups moving along the street graph.
- Far away: saved population totals and coarse migration state, without individual pathfinding.

Transfers between these levels must conserve population. Killing a zombie reduces the saved population; unloading a block does not refill it. Noise redirects existing groups rather than generating an unlimited horde. Cleared locations remain cleared unless another group physically migrates in. Default proposal: no spontaneous replenishment; any later long-term replenishment option must be explicit and occur away from the player.

Retain 60 as the prototype's existing active-enemy limit until profiling justifies another number. It is not a city population limit or a proven performance target. Reserve capacity for visible or engaged enemies and defer additional arrivals rather than deleting enemies during combat. The arena needs its own local encounter budget so it cannot exhaust all city simulation capacity.

## Small procedural dungeons

Start with six reusable families: residential basement, apartment wing, retail stockroom, workshop/storage complex, clinic annex, and utility passage. Proposed scope: 5–12 meaningful spaces, usually 1–2 levels, with a target visit of roughly 5–15 minutes to validate through playtesting.

Entrances stay on the authored map. Each site specifies footprint, theme, door/stair anchors, room budget, difficulty profile, and allowed modules. Generate once per save, then persist layout, enemies, opened paths, and completion. Leaving and returning must never reroll a dungeon.

Generation sequence:

1. Choose a compatible room graph with a reliable entrance-to-objective route.
2. Fit room modules within the site's footprint and align access anchors.
3. Add optional branches or a loop where space allows.
4. Furnish by room purpose, preserving movement clearance.
5. Place enemies outside the arrival buffer and any guaranteed retreat space.
6. Validate reachability after furniture and blockers are present, using player collision clearance.
7. Reject invalid layouts; after bounded attempts use an authored fallback.

If keys or locked doors are introduced, validate the dependency graph so a required key never sits behind its own lock. Ordinary small dungeons permit retreat through the entrance. One-way commitment belongs only to clearly signposted special encounters such as the existing tower. Interior geometry must fit its exterior footprint or have an explicitly designed underground extension.

Proposed first-city content budget: 24 small dungeon sites, four per family, distributed by appropriate building use. Treat this as an initial budget, not a requirement to make every building enterable. Expand only after the families feel distinct. Plan which doors are enterable before dressing streets so players can read the environment consistently.

## Exploration and long-term play

Suggested journey: establish a foothold around Southgate and Dead Lot; branch toward shops, suburbs, or industry; undertake longer trips toward the hospital, station, and downtown; choose a preferred home region. Danger and distance create progression without locking the map into a level sequence.

Base building, inventory, medical supplies, vehicles, utility restoration, and story objectives are possible future systems. Reserve suitable locations for them now, but do not count them as playable features or use them to justify empty spaces. Initially, every built region must support exploration, combat, route choice, and optional dungeon visits with the systems actually available.

## Technical path from the prototype

The current world is built in one module, uses one bounded navigation field, and has no disk persistence or world streaming. The tower already swaps floor scenes and keeps cleared-floor state during a run; it is a useful starting pattern, not yet a city save system.

Before producing the full city:

1. Define a world manifest with stable IDs for districts, blocks, landmarks, dungeon sites, and connections. Keep current local coordinates intact by placing the prototype district through a world transform.
2. Separate authored geometry data from rendering and collision creation. Trial chunk dimensions around 160 units; settle dimensions based on representative density and device performance.
3. Add chunk loading and unloading, local collision queries, and connected local navigation. Avoid one pathfinding grid spanning the full city.
4. Add versioned persistent saves for world seed, player position, populations, dungeon results, and encounter state. Save deltas against authored data and define migration behavior when the map changes.
5. Introduce population activation and coarse migration. Resolve outdoor elapsed time consistently during dungeon visits instead of indefinitely pausing the whole city.
6. Add the small-dungeon generator and validation/fallback path.

Implementation and later verification should follow the project's existing user-owned playtesting workflow. This document changes no runtime behavior and claims no runtime verification.

## Build sequence and planning deliverables

**City atlas first:** fix the outer boundary, river, crossings, major road loops, district boundaries, landmark footprints, and intended travel routes. Then plan each neighborhood's blocks, building uses, enterable doors, population profiles, and dungeon sites. Exact block coordinates remain to be drawn; this proposal is the governing design, not a finished street atlas.

**First connected slice:** preserve Dead Lot and add adjacent Southgate housing plus a retail/service block. Include two alternative outdoor routes, one residential dungeon, and one workshop dungeon. Demonstrate save/load, cleared-area persistence, valid generated layouts, and travel across chunk boundaries before expanding the content budget.

**First city loop:** connect the retail belt, Old Quarter, and Dead Lot. Establish contrasting street densities and a meaningful detour.

**River expansion:** add the central and southern crossings with Eastbank and industry, creating a second major exploration loop.

**Full envelope:** build northern suburbs, campus, downtown depth, and utilities from the agreed atlas. Increase content density where exploration is strongest before increasing map dimensions.

Immediate design decisions for the next atlas pass: the city's visual era, how much ordinary building interior access is desired, and whether eventual driving is a central goal. Road reservations can accommodate driving without implementing it now.
