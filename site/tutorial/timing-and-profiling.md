Before making code faster, **measure** it. Guessing is often wrong.

## A stopwatch

```python run time.perf_counter
import time
start = time.perf_counter()
total = sum(n * n for n in range(1_000_000))
elapsed = time.perf_counter() - start
print(total, f"{elapsed:.3f} seconds")
```

## timeit for small snippets

`timeit` repeats a snippet many times and gives a reliable total.

```python run Comparing two approaches
import timeit
loop = timeit.timeit("[n * 2 for n in range(1000)]", number=2000)
mapped = timeit.timeit("list(map(lambda n: n * 2, range(1000)))", number=2000)
print(f"comprehension: {loop:.3f}s")
print(f"map + lambda:  {mapped:.3f}s")
```

## Finding the slow part

A **profiler** shows which functions take the time. On your own computer:

```python static Profiling with cProfile
import cProfile
cProfile.run("main()", sort="cumulative")
```

Look at the functions with the highest cumulative time and improve those first. Timings vary between runs and machines; compare approaches in the same session.
