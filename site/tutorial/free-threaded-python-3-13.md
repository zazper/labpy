Standard CPython has a GIL. Since **Python 3.13** there is an optional **free-threaded build** (often called `python3.13t`) with the GIL turned off, defined by PEP 703. It was experimental in 3.13; later versions move toward official support, so check the current release notes for its status.

## What changes

- Several threads can run Python bytecode **truly in parallel** on multiple cores. CPU-bound threaded programs can finally speed up.
- Built-in containers (lists, dictionaries, sets) protect themselves with finer-grained locks, so they do not corrupt.
- C extension modules must declare that they support the free-threaded build. If an extension does not, Python re-enables the GIL when it is imported (with a warning).
- There is a cost: single-threaded code can be somewhat slower in the free-threaded build.

## What does not change

- **Your logic is still not thread-safe.** Compound operations such as `counter += 1` and "check then update" still race, as they could before. You still need locks, queues or other synchronisation.
- Async code, multiprocessing and the threading API work the same.
- Complexity, memory use per object and Python semantics are the same.
- Libraries must be thread-safe too, and many need updates.

## Detecting which build you are on

```python run Is the GIL enabled?
import sys
print(sys.version.split()[0])
check = getattr(sys, "_is_gil_enabled", None)
print("GIL enabled:", check() if check else "this Python has no free-threaded support")
```

The samples below need real threads, so they run on the cloud runner (coming later) or your own computer. Download a free-threaded build to see the difference.

```python cloud CPU-bound threads
import sys, time
from concurrent.futures import ThreadPoolExecutor

def work(n):
    return sum(i * i for i in range(n))

N = 2_500_000
start = time.perf_counter()
for _ in range(4):
    work(N)
sequential = time.perf_counter() - start

start = time.perf_counter()
with ThreadPoolExecutor(4) as pool:
    list(pool.map(work, [N] * 4))
threaded = time.perf_counter() - start

gil = getattr(sys, "_is_gil_enabled", lambda: True)()
print(f"GIL enabled: {gil} | sequential {sequential:.2f}s, 4 threads {threaded:.2f}s")
```

```python cloud Shared state still needs a lock
import threading

total = 0
lock = threading.Lock()

def add():
    global total
    for _ in range(100_000):
        with lock:                # without the lock, updates can be lost in any build
            total += 1

threads = [threading.Thread(target=add) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(total)
```

## Should you switch?

- For I/O-bound programs, little changes: threads and async already work.
- For CPU-bound threaded code, it may allow big gains, but check that **all your libraries** support it.
- For production, test carefully. Multiprocessing and vectorised libraries remain the dependable choices today.

## In short

- The free-threaded build removes the GIL so Python threads can run in parallel; extensions must opt in, and single-thread speed may drop.
- It does not make your code thread-safe: shared data still needs locks.
