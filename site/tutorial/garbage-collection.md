CPython manages memory with two cooperating mechanisms.

## 1. Reference counting

Every object counts how many references point to it. When the count reaches zero it is freed **immediately**.

```python run Reference counts
import sys

class Thing:
    def __del__(self):
        print("Thing freed")

t = Thing()
base = sys.getrefcount(t)             # includes one temporary reference from the call itself
alias = t
print("after alias:", sys.getrefcount(t) - base)    # one more
del alias
print("after del:  ", sys.getrefcount(t) - base)    # back to zero extra
print("removing the last reference...")
del t                                  # count hits zero: __del__ runs now
```

## 2. The cycle detector

References that form a loop never reach zero. A separate **garbage collector** finds unreachable cycles and frees them.

```python run A reference cycle
import gc

class Node:
    def __init__(self, name):
        self.name = name
        self.other = None
    def __del__(self):
        print("freed", self.name)

a, b = Node("a"), Node("b")
a.other, b.other = b, a        # a cycle
del a, b
print("deleted names; objects still alive because of the cycle")
print("collected:", gc.collect() > 0)      # the cycle detector frees them
```

The collector is **generational**: new objects are checked often, and survivors are checked less often.

```python run Inspecting the collector
import gc
print(gc.get_threshold())      # when each generation is collected
print(len(gc.get_stats()))     # statistics per generation
print(gc.isenabled())
```

## Weak references

A weak reference does not keep an object alive, which suits caches and back-references.

```python run weakref
import weakref

class Big:
    pass

obj = Big()
ref = weakref.ref(obj, lambda r: print("object was freed"))
print(ref() is obj)
del obj
print(ref())                   # None
```

## Practical advice

- Memory is usually freed promptly; you rarely call `gc.collect()` yourself.
- Avoid `__del__` for clean-up. Its timing is hard to predict; use context managers instead.
- Break cycles (for example with `weakref` for parent links) in long-running services.
- If a process grows, look for objects held by **global caches, closures or lists that never shrink** before blaming the collector. `tracemalloc` helps.
- Large NumPy and pandas arrays are freed as soon as the last reference is dropped.

## In short

- CPython frees objects as soon as their reference count is zero, and runs a generational cycle collector for reference loops.
- Use weak references for caches, and context managers (not `__del__`) for resources.
