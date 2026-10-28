A few habits make Python code faster without making it harder to read. Always measure first.

```python run Membership in a set is fast
import timeit
items_list = list(range(10_000))
items_set = set(items_list)
print("list:", round(timeit.timeit("9999 in items_list", globals=globals(), number=2000), 4))
print("set: ", round(timeit.timeit("9999 in items_set", globals=globals(), number=2000), 4))
```

## Build strings with join

```python run join instead of +=
import timeit
parts = [str(i) for i in range(2000)]
slow = timeit.timeit("s = ''\nfor p in parts: s += p", globals=globals(), number=200)
fast = timeit.timeit("''.join(parts)", globals=globals(), number=200)
print(f"+=:   {slow:.4f}s")
print(f"join: {fast:.4f}s")
```

## More tips

- Use built-ins (`sum`, `min`, `sorted`, `any`) and comprehensions rather than hand-written loops.
- Avoid repeating the same work: store the result in a variable or use `functools.lru_cache`.
- Choose the right data structure: sets and dictionaries for lookups, `deque` for queues.
- Use generators for large sequences so you do not build big lists.
- For number crunching, use NumPy, which runs the loops in fast compiled code.

```python run NumPy versus a Python loop
import numpy as np, timeit
data = list(range(100_000))
arr = np.arange(100_000)
print("python:", round(timeit.timeit("sum(x * 2 for x in data)", globals=globals(), number=20), 4))
print("numpy: ", round(timeit.timeit("(arr * 2).sum()", globals=globals(), number=20), 4))
```
