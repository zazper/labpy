Assigning a list to another name does **not** copy it. Both names refer to the same list.

```python run Two names, one list
a = [1, 2, 3]
b = a
b.append(4)
print(a)          # a changed too
print(a is b)
```

## Making a copy

```python run Shallow copies
a = [1, 2, 3]
b = a.copy()      # also list(a) or a[:]
b.append(4)
print(a, b)
```

## Shallow vs deep

A **shallow** copy copies the outer list but shares the inner objects. A **deep** copy copies everything.

```python run Nested lists
import copy
a = [[1, 2], [3, 4]]
shallow = a.copy()
deep = copy.deepcopy(a)
a[0].append(99)
print(shallow)    # inner list shared, so it changed
print(deep)       # fully independent
```

`==` asks whether values are equal; `is` asks whether they are the same object.
