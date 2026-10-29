How you declare parameters is part of a function's contract. Python lets you control **how** each argument may be passed.

## Positional-only (/) and keyword-only (*)

Parameters before `/` must be passed by position. Parameters after `*` must be passed by name.

```python run Positional-only and keyword-only
def rate(principal, years, /, *, annual_rate, compounding=1):
    return principal * (1 + annual_rate / compounding) ** (years * compounding)

print(rate(1000, 2, annual_rate=0.05))
print(rate(1000, 2, annual_rate=0.05, compounding=12))

try:
    rate(principal=1000, years=2, annual_rate=0.05)
except TypeError as e:
    print("TypeError:", e)
try:
    rate(1000, 2, 0.05)
except TypeError as e:
    print("TypeError:", e)
```

## Why bother?

- **Keyword-only** arguments make calls self-documenting (`annual_rate=0.05`, not a bare `0.05`) and let you add or reorder options later without breaking callers.
- **Positional-only** arguments free you to rename parameters later, and stop callers depending on names that mean little.
- Both prevent mixing up arguments of the same type.

## *args and **kwargs for forwarding

Wrappers use them to pass everything through unchanged.

```python run Forwarding arguments
def log_call(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__, "with", args, kwargs)
        return func(*args, **kwargs)
    return wrapper

@log_call
def price(face, *, ytm):
    return face / (1 + ytm)

print(price(100, ytm=0.05))
```

## Inspecting a signature

```python run inspect.signature
import inspect

def f(a, b=2, /, c=3, *args, d, e=5, **kwargs): ...

sig = inspect.signature(f)
print(sig)
for name, p in sig.parameters.items():
    print(f"{name:7} {p.kind.name:22} default={p.default!r}")
```

## Binding arguments ahead of time

```python run functools.partial
from functools import partial

def convert(value, *, factor, unit):
    return f"{value * factor:.2f} {unit}"

bp = partial(convert, factor=10_000, unit="bp")
print(bp(0.0025))
```

## A gotcha: ordering rules

Parameters without defaults must come before those with defaults, except after `*` where keyword-only parameters may have defaults in any order.

```python run Order of parameters error
def bad(a=1, b):
    return a + b
```

## In short

- `/` makes earlier parameters positional-only; `*` makes later ones keyword-only.
- Use keyword-only for options and units, so call sites read clearly and your API can grow.
- `*args` and `**kwargs` collect extras, mainly for forwarding. `inspect.signature` shows how a function can be called.
