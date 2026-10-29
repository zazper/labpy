A decorator is a function that takes a function and returns a (usually wrapped) function. The basics are in the Decorators topic; here are the questions that come up in practice.

## A timing decorator, done properly

```python run Timing decorator with functools.wraps
import time
from functools import wraps

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(f"{func.__name__} took {(time.perf_counter() - start) * 1000:.2f} ms")
    return wrapper

@timed
def total(n):
    """Add the numbers below n."""
    return sum(range(n))

print(total(500_000))
print(total.__name__, "|", total.__doc__)
```

## Why functools.wraps?

Without it, the wrapper replaces the original function's identity.

```python run What breaks without wraps
import inspect
from functools import wraps

def plain(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

def good(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@plain
def a(x: int) -> int:
    """Doc for a."""
    return x

@good
def b(x: int) -> int:
    """Doc for b."""
    return x

print(a.__name__, a.__doc__)          # wrapper None
print(b.__name__, b.__doc__)          # b Doc for b.
print(inspect.signature(a), inspect.signature(b))
print(hasattr(b, "__wrapped__"))      # the original is kept here
```

`wraps` copies `__name__`, `__doc__`, `__module__`, `__qualname__` and annotations, sets `__wrapped__` (which `inspect.signature` follows), and merges `__dict__`. That keeps help, tracebacks, logging, debuggers and pickling accurate.

## A decorator that takes arguments

You need one more level: a function that returns the decorator.

```python run Decorator with arguments (retry)
from functools import wraps

def retry(times=3, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    print(f"attempt {attempt} failed: {e}")
                    if attempt == times:
                        raise
        return wrapper
    return decorator

calls = {"n": 0}

@retry(times=3, exceptions=(ConnectionError,))
def flaky():
    calls["n"] += 1
    if calls["n"] < 3:
        raise ConnectionError("network down")
    return "ok"

print(flaky())
```

## Usable with or without brackets

```python run Optional arguments
from functools import wraps

def log(func=None, *, prefix="LOG"):
    def decorator(f):
        @wraps(f)
        def wrapper(*a, **k):
            print(prefix, f.__name__, a, k)
            return f(*a, **k)
        return wrapper
    return decorator(func) if func else decorator

@log
def one(x): return x

@log(prefix="DEBUG")
def two(x): return x

one(1)
two(2)
```

## Order and classes

Decorators apply bottom-up (the one nearest the function first). A class can be a decorator too if it defines `__call__`.

```python run Stacking and class decorators
from functools import wraps

def tag(name):
    def deco(f):
        @wraps(f)
        def w(*a, **k):
            return f"<{name}>{f(*a, **k)}</{name}>"
        return w
    return deco

@tag("b")
@tag("i")
def text():
    return "hi"

print(text())          # <b><i>hi</i></b>

class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0
    def __call__(self, *a, **k):
        self.count += 1
        return self.func(*a, **k)

@CountCalls
def f(): pass

f(); f()
print(f.count)
```

## In short

- A decorator is a callable that takes a callable and returns a callable; `@d` means `f = d(f)`.
- Use `functools.wraps` so the wrapper keeps the name, docstring, signature and `__wrapped__`.
- Arguments need an extra layer; the outer function builds and returns the decorator.
- Return the wrapped function's result, and use `try/finally` when you must always run clean-up or timing code.
