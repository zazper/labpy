Choosing a collection comes down to what you do with it most. These are the typical costs in CPython (n is the number of items).

## Complexity cheat sheet

- **list**: index `O(1)`, append `O(1)` (amortised), insert or delete at the start or middle `O(n)`, `x in list` `O(n)`, sort `O(n log n)`.
- **tuple**: like a list for reading, but fixed size and immutable. Smaller and hashable (if its items are).
- **set**: add, remove and `x in set` are `O(1)` on average, because it uses a hash table. No order and no duplicates.
- **dict**: key lookup, insert and delete `O(1)` on average. Keeps insertion order.
- **collections.deque**: append and pop at both ends `O(1)`, middle access `O(n)`.

"On average" means a hash collision-heavy input can degrade toward `O(n)`.

```python run Membership: list versus set
import timeit
items = list(range(50_000))
as_set = set(items)
print("list:", round(timeit.timeit("49_999 in items", globals=globals(), number=500), 4))
print("set: ", round(timeit.timeit("49_999 in as_set", globals=globals(), number=500), 4))
```

## What makes an object hashable?

An object is hashable if it has a `__hash__` that never changes during its life, and equal objects have equal hashes. Sets and dictionary keys must be hashable.

- Hashable: numbers, strings, `None`, `frozenset`, tuples of hashable items.
- Not hashable: `list`, `dict`, `set` (they can change).

```python run Hashable or not
print(hash("abc") == hash("abc"), hash((1, 2)) == hash((1, 2)))
for obj in ([1, 2], {"a": 1}, {1, 2}, (1, [2])):
    try:
        hash(obj)
    except TypeError as e:
        print(type(obj).__name__, "->", e)
```

## Making your own class hashable

If you define `__eq__`, you must define a matching `__hash__` too, or the class becomes unhashable. Base the hash on the same immutable fields used for equality.

```python run Custom hashable class
class Bond:
    def __init__(self, isin, coupon):
        self._isin, self._coupon = isin, coupon

    @property
    def key(self):
        return (self._isin, self._coupon)

    def __eq__(self, other):
        return isinstance(other, Bond) and self.key == other.key

    def __hash__(self):
        return hash(self.key)

positions = {Bond("US1", 0.05): 100}
print(positions[Bond("US1", 0.05)])
print(len({Bond("US1", 0.05), Bond("US1", 0.05)}))
```

```python run Frozen dataclasses are hashable
from dataclasses import dataclass

@dataclass(frozen=True)
class Trade:
    symbol: str
    qty: int

print(len({Trade("A", 1), Trade("A", 1), Trade("B", 2)}))
```

## Choosing

- Need order, duplicates and indexing: list. Fixed record: tuple.
- Fast membership or removing duplicates: set. Lookup by key: dict.
- Queue or sliding window: deque.
- A key made from several values: a tuple (or frozen dataclass).

## In short

- Sets and dictionaries are hash tables with average `O(1)` operations; lists scan in `O(n)`.
- Hashable means an immutable-in-practice object whose hash is stable and consistent with equality.
