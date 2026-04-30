# Lexorank List Ordering

## What is it?

Lexorank replaces position-based ordering (array index) with explicit **rank strings**
that sort alphabetically. Each list item gets a `rank` field — a short string like
`"m"`, `"d"`, `"v"` — and display order is determined by sorting these strings.

When you move an item, only that item's rank changes. A new rank is generated that
sorts between its new neighbors. No other items are touched.

## Why it's needed

### The problem with array-position ordering

Currently, list order is implicit — it's just the index in the JSON array. This
creates three problems:

**1. Sync requires sending everything**

If a user reorders one list, the entire array must be synced because every item's
"position" (its index) has changed. There's no way to express "item X moved" without
sending all items in their new positions.

With lexorank, reordering one item changes only that item's `rank` field. Only the
changed item needs to be synced.

**2. Database storage loses order**

When lists are stored in a database JSON column (e.g. PostgreSQL `jsonb`), the array
order is not guaranteed to survive a round-trip. The database may serialize the array
differently on read. This means lists come back in a different order than they went in.

With lexorank, order is stored explicitly in each item's `rank` field. The array can
be in any order — just sort by `rank` to display correctly. This makes database-backed
sync possible.

**3. Concurrent edits conflict**

If two devices reorder different lists at the same time, both send their full array.
One will overwrite the other. There's no way to merge two different orderings of the
same array.

With lexorank, each device only changes the `rank` of the item it moved. Two
concurrent reorders of different items produce two independent field changes that
merge cleanly with last-write-wins per item.

## How it works

### Generating ranks

`generateRank(prev, next)` returns a string that sorts between `prev` and `next`.
Ranks use a 62-character alphabet in ASCII order: `0-9 A-Z a-z`. Index comparison
and string comparison agree, so `sort()` Just Works.

```
generateRank(null, null)  → "U"      (midpoint of full range)
generateRank("U", null)   → "j"      (midpoint between "U" and max)
generateRank(null, "U")   → "F"      (midpoint between min and "U")
generateRank("a", "z")    → "m"      (midpoint between "a" and "z")
generateRank("a", "b")    → "aU"     (extends when adjacent — always room)
```

The algorithm finds the lexicographic midpoint between two strings character by
character. When adjacent characters leave no room (like `"a"` and `"b"`), it extends
the string to create space. This means you can always insert between any two items —
there's no limit.

### Folder grouping

`sortByRank` handles folders by:

1. Sorting top-level items and folders by rank
2. After each folder, inserting its contents (also sorted by rank)

Moving a folder only changes the folder's rank. Its contents follow automatically
because they reference the folder by ID, and `sortByRank` always groups them after
their folder header.

### Migration from legacy ordering

`ensureRanks` handles existing lists that don't have ranks yet. It walks through
lists in their current order and generates ranks that preserve that order. It also
infers folder membership from position for truly legacy items that have no `folder`
field.

This means adopting lexorank is non-breaking — existing lists get ranks assigned on
first load and continue to display in their current order.

## List item fields

Lexorank adds these fields to each list item:

| Field | Type | Purpose |
|-------|------|---------|
| `rank` | `string` | Sort key — determines display order |
| `folder` | `string\|null` | ID of containing folder, or null for top-level |

## Files

- `src/utils/lexorank.js` — Core algorithm: `generateRank(prev, next)`, `isValidRank(rank)`
- `src/utils/lexorank.test.js` — Tests for rank generation
- `src/utils/list-ordering.js` — List operations: `sortByRank`, `ensureRanks`, `reorderList`, `reorderFolder`, `rankAtTop`, `rankAfter`
- `src/utils/list-ordering.test.js` — Tests for list ordering
