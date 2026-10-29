Modern `asyncio` gives you tools for structured, safe concurrency. These examples use top-level `await`, which LabPy supports. In a normal script, wrap them in `async def main()` and call `asyncio.run(main())`.

## TaskGroup: structured concurrency

A `TaskGroup` runs tasks together and waits for all of them. If one fails, the rest are **cancelled** and the errors are raised together, so no task is left running by accident.

```python run asyncio.TaskGroup
import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)
    return f"{name} done"

async with asyncio.TaskGroup() as tg:
    a = tg.create_task(fetch("A", 0.2))
    b = tg.create_task(fetch("B", 0.1))

print(a.result(), "|", b.result())
```

```python run A failing task cancels the others
import asyncio

async def ok():
    try:
        await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("ok() was cancelled")
        raise

async def boom():
    await asyncio.sleep(0.1)
    raise ValueError("boom")

try:
    async with asyncio.TaskGroup() as tg:
        tg.create_task(ok())
        tg.create_task(boom())
except* ValueError as eg:
    print("caught:", [str(e) for e in eg.exceptions])
```

`except*` handles an **exception group**, which holds every error from the group.

## Timeouts

```python run asyncio.timeout
import asyncio

async def slow():
    await asyncio.sleep(2)

try:
    async with asyncio.timeout(0.2):
        await slow()
except TimeoutError:
    print("gave up after 0.2 s")

try:
    await asyncio.wait_for(slow(), timeout=0.2)
except TimeoutError:
    print("wait_for timed out too")
```

## Cancellation

Cancelling a task raises `CancelledError` inside it at the next `await`. Clean up in `finally`, and normally re-raise.

```python run Cancelling a task
import asyncio

async def worker():
    try:
        while True:
            await asyncio.sleep(0.05)
    finally:
        print("worker cleaned up")

task = asyncio.create_task(worker())
await asyncio.sleep(0.12)
task.cancel()
try:
    await task
except asyncio.CancelledError:
    print("task cancelled:", task.cancelled())
```

## Collecting errors without stopping

```python run gather with return_exceptions
import asyncio

async def job(n):
    if n == 2:
        raise RuntimeError("job 2 failed")
    return n * 10

results = await asyncio.gather(*(job(n) for n in range(4)), return_exceptions=True)
print(results)
```

## Blocking code inside async

A blocking call (a long calculation, `time.sleep`) freezes every task. In a normal Python program run it with `await asyncio.to_thread(func)` (threads) or a process pool. Those need real threads, so they are not available in the browser.

```python static Offloading blocking work
import asyncio, time

def blocking():
    time.sleep(1)
    return "done"

async def main():
    return await asyncio.to_thread(blocking)

print(asyncio.run(main()))
```

## In short

- Use `TaskGroup` so tasks are never orphaned, `asyncio.timeout` to bound waits, and handle `CancelledError` with `finally`.
- Never block the event loop; send blocking work to threads or processes.
