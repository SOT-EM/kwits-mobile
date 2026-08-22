# Feature prompt: interactive jigsaw puzzle member canvas

Use this as the implementation prompt for Claude Code. It documents the full
architecture, the reasoning behind each decision, and step-by-step build
instructions based on a working web simulation of this feature.

---

## 1. Feature summary

On the "invite members" screen, replace the static illustration with an
**interactive, infinite-canvas jigsaw puzzle**. Each invited member becomes
one puzzle piece. Pieces are randomly colored, have a randomized "face"
(personality), and start scattered on the canvas. The user drags pieces
around; a piece only snaps into place when it is near the *one* neighboring
piece it is actually compatible with (matching tab/blank shape) — not just
any nearby piece. Connected pieces then move together as a group. The overall
puzzle silhouette (row, grid, etc.) is chosen automatically based on the
number of members.

This is a from-scratch engine, not a library — jigsaw/canvas libraries don't
give you brand-consistent piece shapes or member-count-driven layouts.

---

## 2. Architecture overview

The system is four independent layers. Keep them decoupled — each should be
testable/replaceable without touching the others.

```
Layer 1 — Layout Resolver     N (member count) -> grid shape + active cells
Layer 2 — Piece Compiler      grid + active cells -> per-piece edge data (tab/blank/flat)
Layer 3 — Personality Assigner per-piece edge data -> + color, iris, brows, eye size
Layer 4 — Renderer + Gestures  piece data -> drawn shape, pan/zoom, drag, compatibility-snap
```

Layers 1–3 are pure functions (no rendering, easily unit-testable). Layer 4 is
the only layer that touches Skia/gesture code.

---

## 3. Layer 1 — Layout Resolver

Pure function: `resolveLayout(memberCount: number): LayoutResult`

Decides only *topology*, never drawing:

```ts
type LayoutResult = {
  rows: number;
  cols: number;
  activeCells: { x: number; y: number }[]; // which grid cells hold a piece
  orientation: 'row' | 'grid';
};
```

Rules table (tune freely — this is a lookup, not hardcoded geometry):

| N | rows x cols | active cells        | orientation |
|---|--------------|---------------------|-------------|
| 2 | 1 x 2        | all                 | row         |
| 3 | 1 x 3        | all                 | row         |
| 4 | 2 x 2        | all                 | grid        |
| 5 | 2 x 3        | 5 of 6 (1 empty)    | grid        |
| 6 | 2 x 3        | all                 | grid        |
| 7 | 3 x 3        | 7 of 9 (2 empty)    | grid        |
| 8 | 3 x 3        | 8 of 9 (1 empty)    | grid        |
| 9 | 3 x 3         | all                 | grid        |

Reasoning: rows are simplest (linear, no vertical edges) so use them for
small N. Beyond ~4, a row becomes a visually awkward long strip on a phone
screen, so switch to a grid. Non-perfect-square counts leave some grid cells
empty rather than forcing an odd exact shape.

---

## 4. Layer 2 — Piece Compiler (edge assignment)

Pure function: `compilePieces(layout: LayoutResult): PieceTopology[]`

For every active cell, look at its 4 grid neighbors (up/down/left/right). If
a neighbor exists and is active, that side gets a connector; otherwise it's
`'flat'` (outer border of the puzzle).

**Critical rule: generate each internal edge exactly once, then assign it to
both adjacent pieces as inverses.** This guarantees every tab has exactly one
matching blank in the whole puzzle — do not independently randomize each
piece's own edges, or two adjacent pieces could both end up as "tab," which
breaks the compatibility model entirely.

```ts
type EdgeType = 'tab' | 'blank' | 'flat';
type PieceTopology = {
  id: string;              // stable id, e.g. memberId
  gridPos: { x: number; y: number };
  edges: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType };
};
```

Algorithm:
1. Walk every pair of horizontally-adjacent active cells. Randomly decide
   `tab` or `blank` once. Assign that value to the left cell's `right` edge,
   and the exact inverse to the right cell's `left` edge.
2. Repeat for vertically-adjacent pairs (`bottom`/`top`).
3. Any edge with no active neighbor on that side = `'flat'`.

---

## 5. Layer 3 — Personality Assigner

Pure function: `assignPersonality(piece: PieceTopology): PieceInstance`

This is what makes pieces feel alive and distinct rather than templated
copies. Each attribute is picked independently and randomly, from an
approved set — never invented freely, so the visual language stays
consistent with the design system.

```ts
type PieceInstance = PieceTopology & {
  color: { fill: string; shade: string };   // from brand palette
  iris: string;                              // from a small approved iris palette
  hasBrows: boolean;                         // ~60% chance
  browTilt: number;                          // small random angle, gives expression variety
  eyeRadiusY: number;                        // slight per-piece size variance
};
```

Design notes carried over from the reference template:
- Eyebrows must be positioned **relative to each eye's own radius**
  (`eyeCenterY - eyeRadiusY - fixedGap`), never a flat pixel offset — otherwise
  brows misalign when `eyeRadiusY` varies per piece.
- `hasBrows` is a coin flip per piece (not per puzzle) so a single puzzle
  naturally mixes brow and no-brow pieces.
- Keep the *shape* of the piece (tab curve, corner radius, shadow strip) 100%
  fixed across all pieces — only cosmetic face attributes and body color vary.
  This is what keeps the feature on-brand instead of looking like generic
  random shape generation.

---

## 6. Layer 4 — Renderer + gesture engine

### 6.1 Rendering
- Use `@shopify/react-native-skia` to draw each piece as a `Path` built from
  the same bezier tab/blank curve function for every piece — parametrize it
  once against the actual design file's curve, not the approximate quadratic
  curve used in the web demo.
- Draw order per piece: body path (fill) -> bottom shadow strip (semi-
  transparent darker rect) -> eyes (white ellipse + colored iris circle) ->
  eyebrows (rounded-cap line), conditionally.

### 6.2 Infinite pan/zoom canvas
- Wrap the whole board in a `Gesture.Pinch()` (scale) composed with
  `Gesture.Pan()` (translate) from `react-native-gesture-handler`, driving
  shared values consumed by Reanimated on the UI thread. This is the "Figma-
  like" infinite workspace feel.
- Piece-level drag gestures must be separate `Gesture.Pan()` instances per
  piece, composed with `Gesture.Simultaneous` against the board's pan so a
  piece drag doesn't also pan the board.

### 6.3 Compatibility-based snapping (the core interaction)
This is the key departure from "snap to a fixed absolute slot" — pieces snap
to *each other*, based on topology, not to a predetermined X/Y position. This
also means the puzzle can be assembled in any order or starting orientation.

```ts
function areCompatible(a: PieceInstance, b: PieceInstance): { side: 'a-right-b-left' | 'a-left-b-right' | ... } | null {
  // Check every shared side (right<->left, bottom<->top) for adjacency in gridPos
  // AND inverse edge types (tab meets blank). Return which side matched, or null.
}
```

On drag release:
1. For every *other* piece not already in the dragged piece's connected
   group, call `areCompatible`.
2. If compatible AND within `SNAP_DISTANCE` of the position that would make
   them flush and correctly oriented, animate the dragged piece's whole group
   into that exact offset (`withSpring`).
3. Merge the two groups' `groupId` so they now move together on future drags.

### 6.4 Connected-group dragging
Maintain a `groupId` per piece (union-find is overkill here given small N —
a simple shared-array-of-ids-with-reassignment is fine, as shown in the demo).
Dragging any piece must move every piece sharing its `groupId` by the same
delta, so assembled clusters behave as one rigid object.

### 6.5 Eyes that track touch
- Maintain a shared value for the current active touch/drag point on the
  board (in canvas space, accounting for current pan/zoom transform).
- Each eye's pupil offset = a vector from the eye's world position toward the
  touch point, clamped to `maxRadius` (e.g. `eyeRadiusY * 0.42`) so pupils
  stay inside the eye white.
- Recompute this every frame the touch point changes, via
  `useAnimatedReaction`, so pupils track continuously during drag as well as
  idle hover (idle tracking only really applies if you support mouse/trackpad
  via a connected input; on touch-only mobile, tracking is driven by active
  touch position and should relax back to center-ish when no touch is active).

---

## 7. Completion state
Puzzle is "complete" when every piece shares the same `groupId`. Surface this
as a boolean the invite screen can react to (e.g. unlock "send invitation",
or just a celebratory state) — this was a simple `.every()` check across all
pieces' group ids in the demo and generalizes directly.

---

## 8. Build order (recommended sequence for Claude Code)

1. Implement Layer 1 + Layer 2 as pure TypeScript functions with unit tests
   (no rendering) — verify edge assignment never produces a mismatched
   tab/tab or blank/blank pair.
2. Implement Layer 3 as a pure function with a snapshot test on a fixed
   random seed.
3. Build the static Skia renderer for a single hardcoded piece using the
   real design-file bezier curve, confirm it matches the reference image
   pixel-for-pixel at a few tab/blank/flat combinations.
4. Wire Layer 2 + 3 output into the renderer for a full puzzle, static
   (no gestures yet) — confirm layouts for N = 2 through 9 look correct.
5. Add pan/zoom on the board.
6. Add per-piece drag (no snapping yet).
7. Add compatibility-check + snap-on-release + group merging.
8. Add eye-tracking last, since it's cosmetic and easiest to layer on once
   drag/snap is solid.

---

## 9. Acceptance criteria
- Changing member count regenerates a topology from the rules table, never a
  hardcoded shape.
- Every tab has exactly one matching blank in the generated puzzle — no
  orphaned or duplicated connectors.
- A piece never snaps to a piece it isn't topologically adjacent to, even if
  dragged very close to it.
- Connected pieces move as one unit on subsequent drags.
- Piece body shape (curve, radius, shadow) is pixel-identical across every
  piece; only color and face attributes vary.
- Puzzle "complete" state is detected the moment all pieces share one group.
