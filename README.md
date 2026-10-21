# Death Comes After You — Part 1: Ten Bells

A standalone cemetery chapter copied from the original game. The original project remains unchanged.

## Play locally
Run `node preview.cjs` from this folder, then visit http://127.0.0.1:4173. The server binds only to the computer's loopback address; it is not available to other devices on the network. Stop it with Ctrl+C.

## The level
Blackthorn Cemetery retains the original 160 by 160 world scale. Grave blocks surround a memorial plaza, with an open ruined chapel to the north, family crypts in the northeast, cypress trees, stone perimeter walls and a locked southern gate. Broad avenues, cross walks and an outer circuit provide connected escape routes.

The player starts with a wooden bat; this chapter has no pistol, tower or boss encounters. Ten waves contain 6, 8, 11, 14, 17, 20, 24, 28, 33 and 40 enemies. Only normal zombies and crawlers appear. Enemies arrive outside the immediate combat space, around the player's location, so exploring does not abandon the encounter.

Wave breaks last 12 seconds and restore full stamina, with no health reward. Automatic follow-up waves can be disabled for manual starts. Clearing wave ten ends the run with a victory screen. Restart resets the chapter.

WASD / arrows move. Mouse aims. Hold left click to swing. Shift runs. Esc pauses. Release attack to recover stamina. Landscape touch controls are also retained.

## Validation
`node verify.mjs` checks starting equipment, all wave counts, allowed enemy types, successful spawning, the wave-ten victory cap, restart, and key navigation routes using a simulated DOM and renderer. Syntax checks and a live desktop browser startup/render inspection passed. These checks do not replace a complete human combat playthrough or phone testing.

Tuning: `js/combat.js` for bat/stamina, `js/zombies.js` for enemies/wave counts, `js/world.js` for cemetery layout.

## Small terrain tiles
Ground tiles are now 2 x 2 world units, so four (2 x 2) fit inside each original 4 x 4 tile. Ten terrain samples are reduced to 32 x 32 pixels in assets/terrain-low.png (128 x 96 atlas). Original terrain sheets are retained as source files but are not loaded by the game. Props retain their original detail. Static geometry is uploaded once and grouped into culled 16m chunks. Run node verify-terrain.mjs for density, UV, atlas and batching checks. This pass was checked without restarting the preview server.




## Forest cemetery reference pass
Inspired by the user-provided Serene Isometric Forest Cemetery reference: continuous world-space grass shading replaces repeated rocks/flowers in the lawn; narrower paths blend into grass at their edges; fewer, slightly offset grave rows; tree copses at the entrance and interior; denser woodland boundary; flowers clustered by monuments and trees. The approved two-metre terrain geometry and 32px atlas remain. Gameplay, no-healing wave breaks, and the existing camera are preserved.

Validation: encounter/navigation checks and terrain/UV/batching checks passed. The entrance was inspected in the live browser after the final path-edge adjustment. This is a reference-inspired landscape pass, not a reproduction of the reference image or a full combat playthrough.

Grass correction: terrain now repeats at 1m for smaller paving detail. Grass and moss textures are visible again (sampled from quieter grass areas of the supplied sheets), with flower tiles used in occasional patches. Dirt paths also retain their source texture. Low-resolution atlas and static batching remain in use.

## Asset cut and terrain join audit
The current ground repeat is 0.8m. Read ASSET_CLASSIFICATION.md for the nine supplied sheets, approved uses, and source coordinates. The runtime uses a clean 54-prop atlas with isolated outlines and transparent gutters; irregular grid crops are replaced. Terrain variants share matched borders within grass, stone and earth families, with no random rotation. Rebuild terrain using tools/build-terrain-joins.ps1 and props using tools/build-props.ps1. tools/verify-cuts.ps1 checks crop gutters and all terrain family border pairings. Geometry, encounter and navigation checks passed, and the final atlas plus live entrance were visually inspected. The preview server remains running.

## Character detail and shirt variation
Player mesh: 10,464 triangles (previously 2,268); normal/crawler: 8,032 (previously 1,676), measured in the idle bat pose. Sixteen-sided profiles, extra shaping rings and beveled detail geometry add contour detail. Animation geometry cache is capped at 48 MiB.

Each zombie receives a persistent shirt variant at spawn: 40% original type color, 15% muted red, 15% blue, 15% yellow, 15% purple. These are spawn probabilities, so small waves will vary. Corpses preserve their shirt color.

Player locomotion advances once per 1.35 units traveled instead of 0.95, reducing animation cadence by about 30%. Actual movement speed, bat swing timing, and zombie movement cadence are unchanged. Character geometry/color tests and encounter checks passed. Browser movement was checked; final-wave performance still needs playtesting.

## Render scale
The game defaults to 50% internal width and height, upscaled to the full CSS canvas with pixelated filtering. HUD and controls stay at display resolution; camera framing and mouse aim still use display coordinates. Select 67% or 100% in the menu if desired. Device pixel density no longer multiplies the game buffer. Verified a 640x360 buffer displaying at 1280x720 in-browser. This reduces pixel workload, but does not reduce character animation or AI CPU work.

Corpse performance: death animations finish in 3D, then each body is captured once into a 128×128 RGBA texture and rendered as a two-triangle ground sprite. Facing and shirt color are preserved. At most one capture runs per frame; textures and buffers are released when bodies leave the retained list (still capped at 24), including restart. Shirt variants now share the same pose geometry and receive their color during vertex submission; the 48 MiB pose cache refreshes recency on use. FPS uses real elapsed time instead of the simulation's capped time step. Run node verify-characters.mjs and visit /verify-corpses.html for color-sharing and GPU capture/cleanup checks.

Zombie polygon reduction: every zombie type now uses eight-sided body profiles and four-sided small details, exactly halving its triangle count in every pose. Normal/crawler: 8,032 → 4,016 triangles. Player detail remains unchanged (10,464 triangles with bat at idle). Shirt sharing and final-pose corpse sprites remain enabled.

Crowd rendering: normal/crawler meshes now contain 3,080 triangles (23.3% below the previous 4,016). All zombie profiles use six sides; player detail is unchanged. ANGLE_instanced_arrays groups identical zombie poses into GPU instanced draws with 32 bytes of transform/color data per actor. Pose vertex buffers are uploaded once and retained in a bounded 48 MiB LRU GPU cache; browsers without the extension use the existing CPU renderer. Scenery, player, corpse sprites and wave sizes retain their existing behavior. /verify-crowd.html exercises 120 animated zombies across eight shared pose groups and checks WebGL errors; this isolates rendering and does not benchmark 120 enemies' AI/pathfinding in the full cemetery.

Chapter intro, progression and scarce equipment
- Start now opens “The Last Visit,” explaining the brother's grave, closed south gate, radio rescue and ten bells. A caretaker's note hints at the guaranteed knife west of the north chapel (-10, -62).
- P / STATS opens the survivor journal and pauses active gameplay. Six rank tracks: melee, shooting, running, endurance, vitality and exploration. Melee rank costs are 50, then 100, then 150 additional swings; every track uses an increasing per-rank requirement, capped at rank 10. Each melee rank reduces cost by 1 (floor 4) and duration by 1.5%. Bonus health never heals current damage.
- Lifetime stats and proficiency save in browser localStorage under deathcomesafteryou.part1.progress.v1, every five seconds and on important events/page exit. Equipment, ammunition and loot reset each run. Storage failure is reported in the journal; corrupted saves safely fall back to defaults.
- Knife: 2 damage, 1.05 m reach, 0.42-second attack, 10 stamina, one target, no stagger/attack interruption/knockback. Bat: 3 damage, 1.9 m reach, 0.7 seconds, 18 stamina, up to three targets with stagger.
- 15 usable weapons: bat, knife, crowbar, hatchet, machete, shovel, sledgehammer, service pistol, heavy revolver, pocket pistol, pump shotgun, double-barrel shotgun, SMG, carbine and hunting rifle. Weapons have distinct balance; visuals use simple shared procedural models with differentiated blades/heads/long barrels.
- Two additional secluded sites (-43, 39 and 43, -39), each with an independent 8% chance of a random non-starter weapon. No enemy drops or replenishing caches. Guns arrive partly loaded with a small finite reserve; reloads never create ammo. Shotguns fire multiple spread pellets. E picks up, Q cycles carried weapons, R reloads. Close-range discovery only; no loot markers on the map.
- Validation: node verify.mjs, node verify-progression.mjs, node verify-characters.mjs. Tests cover rank thresholds, save roundtrip/corruption, restart boundaries, failed swing accounting, knife behavior, finite ammunition, weapon mesh validity and loot reachability.

Atmosphere / pickups / revised premise
- Ground and sprite scenery use a cooler, 24% desaturated shader grade, with RGB brightness multipliers 0.72/0.78/0.79. Characters and HUD keep their current readability; no fullscreen postprocessing pass was added.
- Visible pickups emit pulsing additive ground halos (amber weapons, green health), batched in one draw with depth testing and restored blend/depth state. Knife moved slightly west to (-12, -62) to clear a gravestone sprite's visual overhang.
- Each zombie kill independently rolls a 2% health-box drop at its position. Press E nearby to recover 14 health, capped at current maximum. Full-health players leave the box in place. Boxes persist for the run and count in lifetime healing statistics; they do not enter weapon inventory. No automatic wave-clear healing.
- Prologue is now “Premature Burial”: the player wakes from catalepsy in an unfilled grave and a strangely broken-open coffin, unaware of the outbreak. The brother/radio-rescue story and explicit knife-location hint are removed. The journal also avoids revealing the knife location.
- verify.mjs covers drop probability boundaries, duplicate-kill protection and health-box consumption/capping. /verify-pickups.html verifies the actual gloomy scenery, amber/green halos and clean WebGL render state.

Player carry and movement adjustment
- Removed the backpack body, rear pocket, harness straps and associated front panel.
- Forward walking and sprinting multiply their previous speeds by 0.92; backward walking multiplies its previous speed by 0.96. Pure sideways walking is unchanged. Existing proficiency bonuses and injury slowdown still apply. Rank-zero straight speeds: forward 3.312 m/s, sprint 4.784 m/s, backward 2.0736 m/s.
- Equipped bat rests over the right shoulder with both hands on the handle. The existing swing trajectory and attack timing remain; the supporting hand is solved and locked to the handle through movement, attacks and hit reactions. A small forearm reach correction prevents a floating support hand. No additional per-frame animation solver runs outside the existing pose cache.
- verify.mjs checks actual directional displacement; verify-characters.mjs checks grip continuity and updated player triangle count (10,304). /verify-bat-pose.html shows front, side, back and attack views for visual inspection.

Run ranks and economical day/night cycle
- Proficiency now uses a separate run ledger reset by begin(); lifetime statistics continue saving. Developer mode buttons in the start and pause menus override all six ranks to 10 without inflating earned stats. Turning it off restores the current run's earned ranks. The toggle lasts for the current page session.
- One complete day/night cycle takes 300 seconds of active gameplay, starting in daylight; pausing stops it. A single CSS radial shade updated at 10 Hz darkens the world while leaving the HUD readable. It adds no WebGL passes, shadow maps or dynamic lights.
- Base night halo extends 6 world units. A flashlight pickup on the south approach (0, 50), collected with E, passively extends it to 12 units and brightens its center. It resets with the run.
- Per user request, no tests or browser verification were run for these changes.

Twilight and starting positions
- Five-minute cycle: 120 seconds day, 30 seconds dusk, 120 seconds night, 30 seconds dawn. Twilight fades through amber using the same lightweight CSS overlay, still updated at 10 Hz.
- Night darkness outside the halo increased to 99.5%; unlit center is dimmer too. Flashlight halo reduced from 12 to 7.2 world units (60%); it still improves on the 6-unit unaided halo.
- Flashlight hidden in the central southeast plots at (24, 27). The player now starts on the existing southwest open grave, near (-61.55, 52.08), derived directly from that grave's generated placement.
- Changes made without running tests or browser previews, as requested.

Cycle timing update: full cycle is now 12 minutes (300 seconds day, 60 dusk, 300 night, 60 dawn). Existing lighting and pause behavior are unchanged. No tests run, per the current preference.

Daily needs and night movement
- Normal zombies and crawlers move 6% faster during the full night phase (360–660 seconds of each 720-second cycle). Day, dusk and dawn retain baseline speed.
- Independent food/rest timers advance only during active gameplay. Every 720 seconds adds one Hungry/Tired tier. Tired movement penalties: 5%, 15%, 35%, capped at 75%; Hungry stamina-regeneration penalties: 3%, 9%, 21%, capped at 60%. No starvation damage or passive health loss. Needs reset on a new run; developer max ranks does not erase needs.
- HUD labels show active tiers; hover for penalties. The journal explains the system. Chapter two can use satisfyHunger/satisfyRest to clear the respective timer; no food/rest actions were introduced into the cemetery.
- No tests run, per the current user preference.

Optional HUD
- First-screen HUD toggle defaults to OFF. Hides meters, counters, minimap, objectives, announcements, reticle and footer diagnostics. Pause, touch controls, pickup prompts and manual next-wave controls remain available. Choice lasts for the page session.
- No automatic wave-three/four reveal or companion/story systems implemented. No tests run, per user preference.
