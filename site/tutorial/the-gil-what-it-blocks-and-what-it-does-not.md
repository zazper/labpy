The **Global Interpreter Lock (GIL)** is a lock in the standard CPython interpreter. Only one thread at a time may execute Python bytecode.

## What the GIL blocks

- **Parallel CPU-bound Python code in threads.** Two threads doing pure-Python calculations take turns, so they are no faster than one (often slightly slower).

## What the GIL does not block

- **Waiting on I/O.** A thread waiting for a network reply, a file or `time.sleep()` releases the lock, so other threads run. Threads do speed up I/O-bound work.
- **C code that releases the GIL.** Many NumPy operations, `hashlib`, `zlib` and similar can run in parallel threads.
- **Multiple processes.** Each process has its own interpreter and GIL.
- **Async code.** It runs in one thread by switching tasks while waiting, so the GIL is irrelevant to it.

The GIL does **not** make your code thread-safe either. It protects the interpreter, not your logic.

## A single `+=` is not atomic

```python run The bytecode behind counter += 1
import dis
counter = 0
def bump():
    global counter
    counter += 1
dis.dis(bump)
```

Reading, adding and storing are separate steps, and a thread switch can happen between them, so updates can be lost.

The samples below need real threads, so they run on the cloud runner (coming later) or your own computer.

```python cloud CPU-bound: threads do not help
import time
from concurrent.futures import ThreadPoolExecutor

def work(n):
    return sum(i * i for i in range(n))

N = 2_000_000
start = time.perf_counter()
for _ in range(4):
    work(N)
sequential = time.perf_counter() - start

start = time.perf_counter()
with ThreadPoolExecutor(4) as pool:
    list(pool.map(work, [N] * 4))
threaded = time.perf_counter() - start
print(f"sequential {sequential:.2f}s, 4 threads {threaded:.2f}s")
```

```python cloud I/O-bound: threads help
import time
from concurrent.futures import ThreadPoolExecutor

def wait(_):
    time.sleep(0.5)       # releases the GIL while waiting

start = time.perf_counter()
with ThreadPoolExecutor(8) as pool:
    list(pool.map(wait, range(8)))
print(f"8 waits of 0.5s took {time.perf_counter() - start:.2f}s")
```

```python cloud Lost updates without a lock
import sys, threading
sys.setswitchinterval(1e-6)          # switch threads very often to expose the race
counter = 0

def bump_many():
    global counter
    for _ in range(200_000):
        counter += 1

threads = [threading.Thread(target=bump_many) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print("expected 800000, got", counter)   # may be less
```

## In short

- The GIL lets one thread run Python bytecode at a time. It blocks CPU-bound thread parallelism, but not I/O waits, GIL-releasing C code, processes or async.
- Use threads or async for waiting, processes (or NumPy and similar) for CPU-bound work, and locks for shared data.
- See the Free-threaded Python topic for the build without a GIL.
