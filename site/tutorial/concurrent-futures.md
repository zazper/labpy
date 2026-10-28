`concurrent.futures` offers one simple interface for running work in a pool of threads or processes.

These samples need the cloud runner (coming later) or your own computer.

## Threads for waiting work

```python cloud ThreadPoolExecutor
from concurrent.futures import ThreadPoolExecutor
import time

def fetch(n):
    time.sleep(0.2)          # pretend to wait for a server
    return n * 10

with ThreadPoolExecutor(max_workers=5) as pool:
    print(list(pool.map(fetch, range(5))))
```

## Processes for heavy calculations

```python cloud ProcessPoolExecutor
from concurrent.futures import ProcessPoolExecutor

def is_prime(n):
    if n < 2:
        return False
    return all(n % i for i in range(2, int(n ** 0.5) + 1))

if __name__ == "__main__":
    numbers = [1_000_003, 1_000_033, 1_000_037, 1_000_039]
    with ProcessPoolExecutor() as pool:
        print(list(pool.map(is_prime, numbers)))
```

## Results as they finish

```python cloud submit and as_completed
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def job(n):
    time.sleep(0.3 - n * 0.1)
    return n

with ThreadPoolExecutor() as pool:
    futures = [pool.submit(job, n) for n in (0, 1, 2)]
    for f in as_completed(futures):
        print("finished", f.result())
```

The same `with` block and `map` / `submit` calls work for both kinds of pool, so you can switch between threads and processes by changing one name.
