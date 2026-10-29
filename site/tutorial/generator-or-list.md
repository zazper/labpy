A generator makes values on demand. A list stores them all. Which is better depends on what you need.

## Memory

```python run Memory: list versus generator
import tracemalloc

def peak(make):
    tracemalloc.start()
    total = sum(make())
    peak_bytes = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()
    return total, peak_bytes / 1e6

print("list:      ", peak(lambda: [n * n for n in range(300_000)]))
print("generator: ", peak(lambda: (n * n for n in range(300_000))))
```

The list result holds all 300,000 numbers at once. The generator holds one.

## Laziness

Nothing runs until you ask for a value, so work (and side effects) happen later, and may never happen.

```python run Lazy evaluation
def noisy():
    for i in range(3):
        print("producing", i)
        yield i

g = noisy()
print("generator created, nothing printed yet")
print(next(g))
print("only one item was produced")

squares = [n * n for n in range(3)]     # a list does all the work immediately
```

## Single pass

```python run A generator is used up
g = (n for n in range(3))
print(list(g))
print(list(g))        # empty: already exhausted
```

## When a list wins

- You need to loop **more than once**.
- You need `len()`, **indexing**, slicing or `reversed()` (generators support none of these).
- You need to **sort**, shuffle or change the data in place.
- The data is small, so the memory saving does not matter and a list is simpler and often a little faster.
- You need to pass it to code that expects a sequence (for example indexing a NumPy or pandas structure).

```python run Things a generator cannot do
g = (n for n in range(5))
try:
    print(len(g))
except TypeError as e:
    print("len:", e)
try:
    print(g[0])
except TypeError as e:
    print("index:", e)

data = list(range(5))          # a list can
print(len(data), data[0], data[-1], data[::-1])
```

## Both in one pipeline

Chain generators for streaming, and convert to a list only at the end (or never).

```python run Pipeline
nums = range(1, 1_000_000)
evens = (n for n in nums if n % 2 == 0)
squares = (n * n for n in evens)
first = [next(squares) for _ in range(3)]
print(first)
```

## In short

- Generator: low memory, lazy, one pass. List: all in memory, reusable, indexable, sortable.
- Default to a generator for large or streaming data; use a list when you need random access or repeated passes.
