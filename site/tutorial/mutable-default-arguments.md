A default value is evaluated **once**, when the function is defined, not each time it is called. So a mutable default (a list, dictionary or set) is shared by every call.

```python run The surprise
def add(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add(1))
print(add(2))         # [1, 2]: the same list again
print(add.__defaults__)
```

The shared list is stored on the function object itself, in `__defaults__`.

## The fix: a None sentinel

```python run Create the list inside the function
def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(add(1), add(2))
```

## When None is a valid value

Use a private sentinel object so you can tell "not given" apart from `None`.

```python run A custom sentinel
_MISSING = object()

def lookup(key, default=_MISSING, table={"a": 1}):
    if key in table:
        return table[key]
    if default is _MISSING:
        raise KeyError(key)
    return default

print(lookup("a"), lookup("z", None))
```

## In dataclasses

Dataclasses reject mutable defaults, and you use a factory instead.

```python run default_factory
from dataclasses import dataclass, field

@dataclass
class Portfolio:
    holdings: list = field(default_factory=list)

a, b = Portfolio(), Portfolio()
a.holdings.append("AAPL")
print(a.holdings, b.holdings)
```

## A deliberate use: a cache

Sometimes the shared state is the point (a memo table), but say so in a comment, or use `functools.cache`.

```python run Intentional shared default
def fib(n, _memo={0: 0, 1: 1}):
    if n not in _memo:
        _memo[n] = fib(n - 1) + fib(n - 2)
    return _memo[n]

print(fib(60))
```

## In short

- Defaults are built once at definition time, so a mutable default is shared between calls.
- Use `None` (or a sentinel) and create the object inside the function. Use `field(default_factory=...)` in dataclasses.
