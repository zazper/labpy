**Identity** asks "is this the very same object?" (`is`, `id()`). **Equality** asks "do these have the same value?" (`==`, which calls `__eq__`).

```python run is versus ==
a = [1, 2]
b = [1, 2]
c = a
print(a == b, a is b)      # True False: equal but separate
print(a is c)              # True: the same object
print(id(a) == id(c))
```

## When to use is

Use `is` for `None`, `True` and `False` (singletons). Do not use it for numbers or strings; small-integer and string reuse is an implementation detail of CPython and varies.

```python run Test for None with is
x = None
print(x is None)
```

## Equality is defined by __eq__

By default objects compare by identity. Define `__eq__` to compare by value, and define `__hash__` to match.

```python run Value equality
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)
    __hash__ = None          # mutable, so mark it unhashable on purpose

print(Point(1, 2) == Point(1, 2), Point(1, 2) is Point(1, 2))
```

## Copies: assignment, shallow and deep

```python run Aliasing and nested data
import copy
grid = [[0] * 3] * 3             # three references to the SAME row
grid[0][0] = 9
print(grid)                       # [[9, 0, 0], [9, 0, 0], [9, 0, 0]]

good = [[0] * 3 for _ in range(3)]
good[0][0] = 9
print(good)

orig = {"prices": [1, 2, 3]}
shallow = copy.copy(orig)
deep = copy.deepcopy(orig)
orig["prices"].append(4)
print(shallow["prices"], deep["prices"])   # shallow shares the inner list
```

## Controlling copies in your classes

```python run __copy__ and __deepcopy__
import copy

class Account:
    def __init__(self, owner, history):
        self.owner, self.history = owner, history

    def __copy__(self):
        return Account(self.owner, list(self.history))      # copy the list, share the string

    def __deepcopy__(self, memo):
        return Account(copy.deepcopy(self.owner, memo), copy.deepcopy(self.history, memo))

a = Account("Ada", [1, 2])
b = copy.copy(a)
b.history.append(3)
print(a.history, b.history)
```

`deepcopy` keeps a memo of objects it has already copied, so it handles cycles and shared references correctly.

```python run Deep copy handles cycles
import copy
a = []
a.append(a)                  # a list that contains itself
b = copy.deepcopy(a)
print(b[0] is b, b is not a)
```

## In pandas and NumPy

- `df2 = df` is an alias. `df.copy()` is a copy (deep by default). `arr.copy()` copies an array.
- Slices of NumPy arrays are views that share memory; see the NumPy topics.

## In short

- `is` is identity, `==` is equality. Use `is` only for `None` and other singletons.
- Assignment never copies. A shallow copy shares nested objects; a deep copy duplicates them.
- If you define `__eq__`, think about `__hash__` as well.
