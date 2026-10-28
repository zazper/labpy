A **thread** is a separate flow of execution inside one program. Threads share memory, so they are good for programs that wait a lot (downloads, files). In normal Python they take turns running Python code because of the **GIL** (Global Interpreter Lock), so they do not speed up heavy calculations.

Threads are not available in the browser. The samples below run on the cloud runner (coming later), and you can run them on your own computer today.

```python cloud Starting threads
import threading, time

def worker(name):
    time.sleep(0.2)
    print(f"{name} done")

threads = [threading.Thread(target=worker, args=(f"thread-{i}",)) for i in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print("all finished")
```

## Sharing data safely

When several threads change the same value you need a **Lock**.

```python cloud A lock protects shared data
import threading

counter = 0
lock = threading.Lock()

def add_many():
    global counter
    for _ in range(100_000):
        with lock:
            counter += 1

threads = [threading.Thread(target=add_many) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)
```

## Guidelines

- Use threads for waiting work (I/O). Use processes for CPU-heavy work.
- Prefer `concurrent.futures` (see its topic) over managing threads by hand.
- Avoid sharing changing data; pass messages with `queue.Queue` instead.
