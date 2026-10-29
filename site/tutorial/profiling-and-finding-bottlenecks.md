Before optimising, **find out where the time and memory actually go**. Measure first, change one thing, measure again.

## Time: the whole program or a block

```python run perf_counter and timeit
import time, timeit

start = time.perf_counter()
data = [i * i for i in range(1_000_000)]
print(f"building: {time.perf_counter() - start:.3f}s")

print("sum():  ", round(timeit.timeit("sum(data)", globals=globals(), number=20), 3))
print("loop:   ", round(timeit.timeit("t = 0\nfor x in data: t += x", globals=globals(), number=20), 3))
```

## Time: which function is slow?

A **profiler** reports how often each function was called and how long it took.

```python run cProfile and pstats
import io, pstats

try:
    import cProfile as profiler
except ImportError:
    import profile as profiler

def slow_part():
    return sum(i * i for i in range(300_000))

def fast_part():
    return sum(range(1000))

def main():
    for _ in range(3):
        slow_part()
        fast_part()

pr = profiler.Profile()
pr.enable()
main()
pr.disable()

out = io.StringIO()
pstats.Stats(pr, stream=out).sort_stats("cumulative").print_stats(5)
print(out.getvalue())
```

Read the columns: `ncalls` (how often), `tottime` (time in the function itself) and `cumtime` (including what it calls). Start with the highest `cumtime` in code you control. On your computer you can also run `python -m cProfile -s cumtime script.py`.

## Memory: who is using it?

```python run tracemalloc
import tracemalloc

tracemalloc.start()
big_list = [str(i) * 3 for i in range(100_000)]
small = [1, 2, 3]
snapshot = tracemalloc.take_snapshot()

for stat in snapshot.statistics("lineno")[:2]:
    print(stat)
current, peak = tracemalloc.get_traced_memory()
print(f"current {current / 1e6:.1f} MB, peak {peak / 1e6:.1f} MB")
tracemalloc.stop()
```

## Quick size checks

```python run sys.getsizeof
import sys
print(sys.getsizeof([]), sys.getsizeof(list(range(1000))))
print(sys.getsizeof("abc"), sys.getsizeof({1: 2}))
```

`getsizeof` counts only the object itself, not what it refers to.

## A routine that works

- **Reproduce** the slowness with a small, repeatable test.
- **Profile** to find the hot spot; the real cause is rarely where you guess.
- **Improve the algorithm or data structure** first (sets, dictionaries, vectorization), then micro-details.
- **Re-measure** to confirm the gain, and keep the faster version only if it is clearly better and still readable.
- For line-by-line timing, use the `line_profiler` package; for memory growth over time, `tracemalloc` snapshots.

## In short

- Use `perf_counter`/`timeit` for timing, `cProfile` to find slow functions, and `tracemalloc` for memory.
- Measure before and after every change.
