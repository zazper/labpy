**Async** code lets a program wait for slow things (timers, network replies) without blocking everything else. `async def` defines a coroutine, and `await` pauses it until a result is ready.

```python run Two tasks at once
import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)      # pretend to wait for a server
    return f"{name} finished after {delay}s"

results = await asyncio.gather(fetch("A", 0.3), fetch("B", 0.1), fetch("C", 0.2))
print(results)
```

The three waits overlap, so the total time is about 0.3 seconds, not 0.6.

## Await works at the top level in LabPy

The example above uses `await` directly. In a normal Python file you wrap the code in a function and start it with `asyncio.run()`:

```python static In a regular script
import asyncio

async def main():
    results = await asyncio.gather(fetch("A", 0.3), fetch("B", 0.1))
    print(results)

asyncio.run(main())
```

In LabPy do not call `asyncio.run()`; the page already runs an event loop, so just use `await`.

## Tasks

```python run create_task
import asyncio

async def worker(n):
    await asyncio.sleep(0.1 * n)
    print("worker", n, "done")

tasks = [asyncio.create_task(worker(n)) for n in (3, 1, 2)]
await asyncio.gather(*tasks)
```

Async is for waiting (I/O-bound work). It does not make heavy calculations faster; that needs multiple processes.
