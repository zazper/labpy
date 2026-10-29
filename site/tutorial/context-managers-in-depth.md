A context manager guarantees set-up and clean-up around a block, even if the block raises. The `with` statement calls `__enter__` on the way in and `__exit__` on the way out.

## With a class

```python run Class-based context manager
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        print(f"block took {self.elapsed * 1000:.1f} ms")
        return False        # False: do not hide any exception

with Timer() as t:
    sum(range(1_000_000))
print(t.elapsed > 0)
```

`__exit__` receives the exception details. Return `True` to **suppress** the exception, but do this rarely.

## With contextlib

`@contextmanager` turns a generator into a context manager. Code before `yield` is set-up, code after is clean-up; wrap the `yield` in `try/finally`.

```python run Generator-based context manager
from contextlib import contextmanager

@contextmanager
def transaction(conn):
    try:
        yield conn
        conn.commit()
        print("committed")
    except Exception:
        conn.rollback()
        print("rolled back")
        raise

import sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE t (x INTEGER)")

with transaction(db):
    db.execute("INSERT INTO t VALUES (1)")

try:
    with transaction(db):
        db.execute("INSERT INTO t VALUES (2)")
        raise ValueError("bad data")
except ValueError:
    pass

print(db.execute("SELECT * FROM t").fetchall())     # only the first row
```

## Where they fit in analytics code

- Temporary settings that must be restored: `pd.option_context` and `np.errstate`.
- Timing and logging a step of a pipeline.
- Database transactions and connections, locks, temporary files and folders.

```python run Temporary options
import numpy as np
import pandas as pd

df = pd.DataFrame({"x": [1 / 3, 2 / 3]})
with pd.option_context("display.precision", 2):
    print(df)
print(df)                            # original precision restored

with np.errstate(divide="ignore", invalid="ignore"):
    print(np.array([1.0, 0.0]) / np.array([0.0, 0.0]))   # no warnings printed
```

## Handy tools in contextlib

```python run suppress and ExitStack
from contextlib import suppress, ExitStack, redirect_stdout
import io, os

with suppress(FileNotFoundError):
    os.remove("does-not-exist.txt")      # no error

buf = io.StringIO()
with redirect_stdout(buf):
    print("captured")
print(repr(buf.getvalue()))

with ExitStack() as stack:               # a dynamic number of managers
    files = [stack.enter_context(open(f"f{i}.txt", "w")) for i in range(3)]
    for i, f in enumerate(files):
        f.write(str(i))
print("closed:", all(f.closed for f in files))
```

## In short

- `with` guarantees clean-up. Write one with `__enter__`/`__exit__` or with `@contextmanager` and `try/finally`.
- Use them for anything that must be undone: options, files, locks, connections, transactions and timers.
