Processes avoid the GIL, but starting them and moving data between them has a cost. These patterns keep that overhead low.

The samples need real processes, so they run on the cloud runner (coming later) or your own computer. Always guard the entry point with `if __name__ == "__main__":`.

## Chunk the work

Sending one tiny task at a time wastes time on communication. `chunksize` sends batches.

```python cloud chunksize reduces overhead
import time
from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    data = range(200_000)
    with Pool(4) as pool:
        start = time.perf_counter()
        pool.map(square, data, chunksize=1)
        print(f"chunksize=1:     {time.perf_counter() - start:.2f}s")
        start = time.perf_counter()
        pool.map(square, data, chunksize=5_000)
        print(f"chunksize=5000:  {time.perf_counter() - start:.2f}s")
        start = time.perf_counter()
        sum(map(square, data))
        print(f"one process:     {time.perf_counter() - start:.2f}s  (tiny tasks may not be worth it)")
```

## Send little, return little

Arguments and results are **pickled** and copied. Pass ids or file paths and let workers load the data, and return summaries instead of big objects.

```python cloud Workers load their own data
import os
import numpy as np
from multiprocessing import Pool

def summarise(path):
    data = np.load(path)                      # each worker loads its own file
    return (os.path.basename(path), float(data.mean()))

if __name__ == "__main__":
    paths = []
    for i in range(4):
        np.save(f"part{i}.npy", np.random.rand(500_000) + i)
        paths.append(f"part{i}.npy")
    with Pool(4) as pool:
        print(pool.map(summarise, paths))
```

## Share big arrays without copying

`multiprocessing.shared_memory` lets processes view the same block of memory.

```python cloud Shared memory
import numpy as np
from multiprocessing import Pool
from multiprocessing import shared_memory

SHAPE, DTYPE = (1_000_000,), np.float64

def partial_sum(args):
    name, start, stop = args
    shm = shared_memory.SharedMemory(name=name)
    arr = np.ndarray(SHAPE, dtype=DTYPE, buffer=shm.buf)
    result = float(arr[start:stop].sum())
    shm.close()
    return result

if __name__ == "__main__":
    data = np.arange(SHAPE[0], dtype=DTYPE)
    shm = shared_memory.SharedMemory(create=True, size=data.nbytes)
    np.ndarray(SHAPE, dtype=DTYPE, buffer=shm.buf)[:] = data
    ranges = [(shm.name, i, i + 250_000) for i in range(0, SHAPE[0], 250_000)]
    with Pool(4) as pool:
        print(sum(pool.map(partial_sum, ranges)), "vs", float(data.sum()))
    shm.close()
    shm.unlink()
```

## Initialise workers once

```python cloud A pool initializer
from multiprocessing import Pool

_table = None

def init(size):
    global _table
    _table = {i: i * i for i in range(size)}     # built once per worker, not per task

def lookup(i):
    return _table[i]

if __name__ == "__main__":
    with Pool(2, initializer=init, initargs=(1000,)) as pool:
        print(pool.map(lookup, [3, 30, 300]))
```

## Results as they finish

```python cloud imap_unordered
import random, time
from multiprocessing import Pool

def job(n):
    time.sleep(random.random() * 0.2)
    return n

if __name__ == "__main__":
    with Pool(4) as pool:
        for result in pool.imap_unordered(job, range(8)):
            print("finished", result)
```

## Choosing the start method

On Linux, processes are usually **forked** (fast, share memory copy-on-write). On Windows and macOS they are **spawned** (fresh interpreter, slower, needs the `__main__` guard). Fork can be unsafe together with threads, so prefer the explicit `multiprocessing.get_context("spawn")` in libraries.

## In short

- Batch tasks with `chunksize`, send small arguments, and return small results.
- Use shared memory for big read-only arrays, pool initializers for per-worker set-up, and `imap_unordered` for streaming results.
- Always measure: for small jobs a single process can be faster.
