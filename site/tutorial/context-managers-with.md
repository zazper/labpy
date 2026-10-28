A **context manager** sets something up and cleans up afterwards, even if there is an error. You use one with the `with` statement.

```python run with open
with open("notes.txt", "w") as f:
    f.write("saved safely\n")

print(f.closed)           # the file was closed automatically
print(open("notes.txt").read())
```

## Your own with contextlib

The `contextmanager` decorator turns a generator into a context manager.

```python run A timer context manager
import time
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"{label}: {time.perf_counter() - start:.4f}s")

with timer("sum"):
    total = sum(range(1_000_000))
print(total)
```

## A class-based version

```python run __enter__ and __exit__
class Announce:
    def __enter__(self):
        print("start")
        return self

    def __exit__(self, exc_type, exc, tb):
        print("end")
        return False      # do not hide errors

with Announce():
    print("working")
```
