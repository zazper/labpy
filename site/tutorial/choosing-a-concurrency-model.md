Picking the wrong model costs you either complexity or speed. Start from **what the program is waiting on**.

## A decision guide

- **Waiting on I/O** (network, disk, databases, many small requests): use **async** for thousands of connections, or **threads** for a modest number or for libraries that block.
- **Heavy calculation in pure Python**: use **processes** (`multiprocessing`, `ProcessPoolExecutor`), or move the loop into **NumPy/pandas** (vectorize) or compiled code.
- **Heavy calculation in NumPy or other C code that releases the GIL**: threads can work, but measure.
- **Many small tasks, each short**: batch them, because per-task overhead (starting, pickling, scheduling) can exceed the work.
- **Data larger than memory**: stream or chunk it, then parallelise over chunks.

Always **vectorize first**. It is usually the biggest win and needs no concurrency at all.

## Reasoning about speed-up: Amdahl's law

If a fraction `p` of the work can run in parallel on `n` workers, the best speed-up is `1 / ((1 - p) + p / n)`. The serial part limits you.

```python run Amdahl's law
def speedup(p, n):
    return 1 / ((1 - p) + p / n)

for p in (0.5, 0.9, 0.99):
    print(f"p={p}:", [round(speedup(p, n), 2) for n in (2, 4, 8, 16, 1000)])
```

With 90 percent parallel work, 16 workers give only about 6.4 times, and no number of workers beats 10 times.

## Reasoning about throughput: Little's law

For a stable system, **average items in the system = arrival rate x average time in the system** (`L = λ × W`).

```python run Little's law and pool sizing
# A service handles 200 requests per second; each takes 0.25 s (mostly waiting on a database).
arrival_rate = 200           # requests per second
latency = 0.25               # seconds per request
in_flight = arrival_rate * latency
print("requests in flight on average:", in_flight)

# So you need at least ~50 concurrent workers (threads or async tasks), and headroom above that.
for workers in (40, 50, 64):
    capacity = workers / latency
    print(f"{workers} workers can sustain {capacity:.0f} req/s ->", "ok" if capacity > arrival_rate else "falls behind")
```

If workers cannot keep up, a queue grows without limit, which is why **back-pressure** matters (see that topic).

The samples below compare models. They need real threads and processes, so they run on the cloud runner (coming later) or your own computer.

```python cloud Same I/O job, three ways
import time
from concurrent.futures import ThreadPoolExecutor

def fetch(_):
    time.sleep(0.2)              # stands in for a network call
    return 1

start = time.perf_counter()
for i in range(10):
    fetch(i)
print(f"sequential: {time.perf_counter() - start:.2f}s")

start = time.perf_counter()
with ThreadPoolExecutor(10) as pool:
    list(pool.map(fetch, range(10)))
print(f"10 threads: {time.perf_counter() - start:.2f}s")
```

```python cloud Same CPU job: threads versus processes
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def crunch(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    jobs = [1_500_000] * 4
    for label, Pool in (("threads", ThreadPoolExecutor), ("processes", ProcessPoolExecutor)):
        start = time.perf_counter()
        with Pool(4) as pool:
            list(pool.map(crunch, jobs))
        print(f"{label}: {time.perf_counter() - start:.2f}s")
```

## In short

- I/O-bound: async or threads. CPU-bound Python: processes. Numeric loops: vectorize first.
- Estimate with Amdahl's law (the serial part limits speed-up) and Little's law (concurrency = rate x latency), then measure.
