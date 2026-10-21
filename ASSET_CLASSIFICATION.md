# Cemetery asset classification and crop audit

Scope: the nine sheets supplied by the user: 001, 002, 007, 013–018. Original files remain unchanged. Coordinates are top-left origin, in source pixels. Terrain metadata: tools/terrain-sources.json. Prop metadata: assets/props-clean.json and tools/prop-sources.json.

## Sheet classification

- **001 — road kit:** marked asphalt, crosswalk, curb, drain, manhole, cracked asphalt, paving. Excluded from this forest cemetery; the dedicated cemetery kit is more appropriate.
- **002 — road junction kit:** intersections, corners, crossings, asphalt damage, sidewalk connections. Excluded from cemetery terrain.
- **007 — mixed ground kit:** asphalt (row 1 and row 4 column 2) excluded; paving and curb samples (row 2) reserved for stone ground; grass, earth and stepping stones (rows 3–4) supply vegetation and trail samples. Curbs are directional boundaries, not random fill.
- **013 — cemetery terrain:** row 1: grave vignette, paving, grass, corner; row 2: open grave vignette, earth, paving boundary, paired graves; row 3: corner, broken paving, worn earth, stone boundary; row 4: flowered grass, stepping stones, fallen branch/grave vignette, mixed broken stone. Grave vignettes are not repeated as flat ground beneath upright props. Only terrain-only regions are sampled.
- **014 — cemetery architecture:** mausoleum, iron panel, arch, gothic shrine; gate, ruined wall, crypt door, wall end; mourning angel, sarcophagus, balustrade, broken column; gothic window, corner wall, broken fence, columbarium.
- **015 — cemetery props:** headstone, cross, broken stone, angel; lantern, shovel, open grave, coffin; dead shrub, small fence, urn, raven; sign, candles, bones, blood. Each is a distinct isolated prop, not a floor tile.
- **016 — vegetation:** vine, grass tuft, wildflowers, bush, bare brush, thicket, tall grass, roots. The separate fallen branch and small leaf patch are reserved, not used as terrain fill.
- **017 — trees and wood:** oak, dead tree, pine, fallen log, stump, sapling. Trunk/wood collision is separate from foliage outlines.
- **018 — debris:** masonry rubble, wall rubble, bricks, stones, wrecked fence, glass, timbers, mixed debris. Asphalt with yellow markings is excluded. Scorched earth is reserved. Disconnected rubble fragments are retained together within their own regions.

## Crop correction

Regular grid cuts were incorrect for these presentation sheets. Alpha-connected silhouettes locate complete architecture, gravestones and vegetation. A narrow alpha fringe is retained; neighboring disconnected sprites are excluded. Debris uses dedicated whole-cluster regions. The blood region starts below the raven to exclude the previous row's pixels.

54 assets are packed into props-clean.png with transparent gutters. The atlas was visually reviewed; full tree crowns, fence tips, gate pillars, headstone bases and wings are retained. Source coordinates and categories are recorded per asset. At runtime only the cleaned prop atlas and low-resolution terrain atlas are loaded.

## Terrain assembly

Ground repeats are 0.8m, 20% smaller than the previous 1m pass. Source-derived textures remain 32px. Grass/moss/flowers, stone/paving, and earth/trail use separate shared-border families; stone variants are no longer randomly rotated. Five-pixel border transitions retain the interior artwork while joining neighboring variants. Path-to-grass boundaries retain their soft world-space transition. Collision remains independent of terrain artwork.

Validation distinguishes exact border checks and crop-gutter checks from visual review. Tests do not imply an exhaustive combat playthrough.
