---
name: RN flex:1 + flexWrap causes vertical letter-stacked text
description: Why grid tiles sometimes render text one letter per line in React Native / Expo web
---

Wrapping a grid item's outer `Pressable`/touchable in `{ flex: 1 }` while the parent row has `flexWrap: "wrap"` and an inner child has a percentage width (e.g. `width: "47.5%"`) can cause siblings to be squeezed into a single row instead of wrapping to 2-per-row. The percentage width on the inner child then resolves against the squeezed (very narrow) outer width, and `Text` wraps character-by-character (vertical letter stack).

**Why:** `flex: 1` on all items in a flexWrap row makes them share the row's width equally regardless of intended wrap breakpoints, since flex-basis/grow takes priority over letting items overflow to the next line.

**How to apply:** For 2-per-row (or N-per-row) wrapping grids, put the percentage width directly on the outer touchable/pressable (the flex item), not on an inner child, and do not add `flex: 1` to that same outer element. Also add `numberOfLines` to labels as a defensive fallback.
