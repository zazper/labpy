A **decorator** wraps a function to add behaviour without changing its code. The `@name` line above a `def` applies it.

```python run A simple decorator
def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@shout
def greet(name):
    return f"hello, {name}"

print(greet("ada"))
```

`@shout` is shorthand for `greet = shout(greet)`.

## A timing decorator

```python run Timing a function
import time
from functools import wraps

def timed(func):
    @wraps(func)               # keeps the original name and docstring
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timed
def slow_sum(n):
    return sum(range(n))

print(slow_sum(1_000_000))
```

## Decorators with arguments

```python run Repeat decorator
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def hi():
    print("hi")

hi()
```
