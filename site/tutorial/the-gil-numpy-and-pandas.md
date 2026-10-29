NumPy and pandas can run on several threads at once, because much of their work happens in compiled C code that **releases the GIL**. But not always.

## When the GIL is released

- Many NumPy array operations on large arrays (element-wise arithmetic, reductions, sorting) run in C without holding the GIL, so threads working on different arrays can overlap.
- Linear algebra (matrix multiply, solves) calls optimised libraries (BLAS/LAPACK) that often use several cores by themselves.
- pandas builds on NumPy, so column arithmetic and many Cython routines (parts of groupby, rolling and merge) can overlap too.

## When it is not

- **Small arrays**: the per-call Python overhead dominates, so threads just contend for the lock.
- **Python-level callbacks**: `apply`, `np.vectorize`, `map` with a Python function, row loops. The function itself needs the GIL.
- **Object dtype** (mixed Python objects, many string operations on older dtypes): operations run Python code per element.
- **Memory-bound work**: threads compete for memory bandwidth rather than CPU.
- **Shared mutable data**: the GIL does not stop you corrupting an array two threads write to.

These details vary by operation and library version, so **measure rather than assume**.

```python run Overhead on small arrays
import numpy as np, timeit
small = np.arange(10, dtype=float)
big = np.arange(10_000_000, dtype=float)
t_small = timeit.timeit(lambda: small * 2, number=100_000) / 100_000
t_big = timeit.timeit(lambda: big * 2, number=5) / 5
print(f"small array: {t_small * 1e6:.2f} microseconds per call (mostly overhead)")
print(f"big array:   {t_big * 1e3:.2f} ms per call (real work)")
```

The samples below need real threads, so they run on the cloud runner (coming later) or your own computer.

```python cloud Threads with large NumPy operations
import time
import numpy as np
from concurrent.futures import ThreadPoolExecutor

arrays = [np.random.rand(3_000_000) for _ in range(4)]

def work(a):
    return float(np.sqrt(a * a + 1.0).sum())

start = time.perf_counter()
for a in arrays:
    work(a)
sequential = time.perf_counter() - start

start = time.perf_counter()
with ThreadPoolExecutor(4) as pool:
    list(pool.map(work, arrays))
threaded = time.perf_counter() - start
print(f"sequential {sequential:.2f}s, threaded {threaded:.2f}s")
```

```python cloud A Python callback keeps the GIL
import time
import numpy as np
import pandas as pd
from concurrent.futures import ThreadPoolExecutor

frames = [pd.DataFrame({"x": np.random.rand(200_000)}) for _ in range(4)]

def python_level(df):
    return df["x"].apply(lambda v: v * 2 + 1).sum()      # one Python call per element

start = time.perf_counter()
for f in frames: python_level(f)
sequential = time.perf_counter() - start

start = time.perf_counter()
with ThreadPoolExecutor(4) as pool:
    list(pool.map(python_level, frames))
threaded = time.perf_counter() - start
print(f"sequential {sequential:.2f}s, threaded {threaded:.2f}s   (little or no gain)")
```

## What to do for parallel pandas work

- Vectorize first; it often removes the need for parallelism.
- Split the data into independent chunks (by date, symbol or file) and process them in **separate processes**.
- Consider tools designed for parallel tables: Polars, DuckDB or Dask.
- Control hidden thread pools, such as BLAS threads, so they do not fight your own pool (the `threadpoolctl` package helps).

## In short

- NumPy and pandas release the GIL in much of their compiled code, so large vectorised operations can scale on threads.
- Python callbacks, object dtype and small arrays do not. Measure, and prefer processes for chunked pandas work.
