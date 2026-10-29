**Back-pressure** means slowing the producers down when the consumers cannot keep up. Without it, a fast producer fills memory with queued work until the service crashes or latency becomes unbounded.

## An unbounded queue hides the problem

```python run Unbounded queue grows
import asyncio

queue = asyncio.Queue()                  # no limit

async def producer():
    for i in range(50):
        await queue.put(i)               # never waits
        await asyncio.sleep(0.001)

async def consumer():
    while True:
        await queue.get()
        await asyncio.sleep(0.01)        # 10x slower than the producer
        queue.task_done()

c = asyncio.create_task(consumer())
await producer()
print("items waiting in the queue:", queue.qsize())
c.cancel()
```

## A bounded queue pushes back

With `maxsize`, `put()` waits when the queue is full, so the producer is slowed to the consumer's pace.

```python run Bounded queue
import asyncio, time

queue = asyncio.Queue(maxsize=5)
start = time.perf_counter()

async def producer():
    for i in range(20):
        await queue.put(i)               # waits when 5 items are queued
    print(f"producer finished at {time.perf_counter() - start:.2f}s")

async def consumer():
    while True:
        await queue.get()
        await asyncio.sleep(0.02)
        queue.task_done()

c = asyncio.create_task(consumer())
await producer()
await queue.join()                       # wait until everything is processed
print(f"all done at {time.perf_counter() - start:.2f}s, queue size {queue.qsize()}")
c.cancel()
```

## Limit concurrency with a semaphore

```python run Semaphore
import asyncio

limit = asyncio.Semaphore(3)
active = peak = 0

async def call(n):
    global active, peak
    async with limit:
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.05)
        active -= 1

await asyncio.gather(*(call(n) for n in range(20)))
print("peak concurrent calls:", peak)
```

## Shed load when full

Sometimes it is better to refuse new work than to make everyone wait: return "busy" (such as HTTP 429) instead of queueing.

```python run Load shedding
import asyncio

queue = asyncio.Queue(maxsize=3)
accepted = rejected = 0
for i in range(10):
    try:
        queue.put_nowait(i)
        accepted += 1
    except asyncio.QueueFull:
        rejected += 1
print("accepted", accepted, "| rejected", rejected)
```

## Design checklist

- Every queue and buffer has a **limit**. Decide what happens when it is full: wait, drop, or reject.
- Put **timeouts** on every wait, so a slow dependency cannot hold resources forever.
- Limit **concurrency** (semaphores, worker pools) to what downstream systems can handle.
- Measure **queue depth and latency**; rising depth is the early warning.
- Propagate back-pressure to callers (slow reads, rejections, retry-after hints), and use **retries with back-off and jitter**, not instant retries.

## In short

- Back-pressure stops producers from outrunning consumers. Use bounded queues, semaphores, timeouts and, when needed, load shedding.
- An unbounded queue just turns overload into memory growth and latency.
