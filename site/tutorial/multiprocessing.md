**Multiprocessing** runs several Python processes at once, each with its own memory and its own GIL. This is the way to use multiple CPU cores for heavy calculations.

Processes are not available in the browser, so these samples need the cloud runner (coming later) or your own computer.

```python cloud A pool of workers
from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    with Pool(4) as pool:
        print(pool.map(square, range(10)))
```

The `if __name__ == "__main__":` check is required, because each worker process imports your file again.

## Heavy work in parallel

```python cloud CPU-bound work
import time
from multiprocessing import Pool

def busy(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    jobs = [2_000_000] * 4
    start = time.perf_counter()
    with Pool() as pool:
        results = pool.map(busy, jobs)
    print(len(results), "jobs done in", round(time.perf_counter() - start, 2), "s")
```

## Things to remember

- Data is copied between processes, so avoid sending huge objects back and forth.
- Starting a process takes time; use it for jobs that run for a while.
- The functions you send must be defined at the top level of a module.
