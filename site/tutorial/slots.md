Normally every instance stores its attributes in a per-object dictionary (`__dict__`). Declaring `__slots__` replaces that dictionary with fixed storage, which saves memory and blocks stray attributes.

```python run A class with __slots__
class Plain:
    def __init__(self, x, y):
        self.x, self.y = x, y

class Slotted:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

p, s = Plain(1, 2), Slotted(1, 2)
print(hasattr(p, "__dict__"), hasattr(s, "__dict__"))

s.x = 10                      # allowed
try:
    s.z = 3                    # not allowed
except AttributeError as e:
    print("AttributeError:", e)
```

## Measuring the saving

```python run Memory of 100,000 objects
import tracemalloc

class Plain:
    def __init__(self, a, b, c):
        self.a, self.b, self.c = a, b, c

class Slotted:
    __slots__ = ("a", "b", "c")
    def __init__(self, a, b, c):
        self.a, self.b, self.c = a, b, c

def measure(cls):
    tracemalloc.start()
    objs = [cls(1, 2, 3) for _ in range(100_000)]
    used = tracemalloc.get_traced_memory()[0] / 1e6
    tracemalloc.stop()
    return round(used, 1)

print("plain  :", measure(Plain), "MB")
print("slotted:", measure(Slotted), "MB")
```

## Trade-offs

- Big saving when you create **many small objects** (millions of ticks, nodes or rows); little effect for a few objects.
- No dynamic attributes, and no `__weakref__` unless you list it in `__slots__`.
- Inheritance: a subclass without its own `__slots__` gets a `__dict__` again; redeclare slots in each class.
- Dataclasses can do it for you: `@dataclass(slots=True)`.

```python run dataclass(slots=True)
from dataclasses import dataclass

@dataclass(slots=True)
class Tick:
    symbol: str
    price: float

t = Tick("A", 1.0)
print(t, hasattr(t, "__dict__"))
```

## In short

- `__slots__` swaps the per-instance dictionary for fixed fields: smaller objects and no accidental attributes.
- Use it for large numbers of small objects; for analytics, columnar data (NumPy and pandas) usually saves far more.
