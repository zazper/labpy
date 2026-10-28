A **set** is an unordered collection of **unique** items. Use curly braces or `set()`.

```python run Creating sets
colors = {"red", "green", "blue", "red"}
print(colors)             # duplicates removed
print(len(colors))
print("red" in colors)    # fast membership test
```

An empty set must be written `set()`, because `{}` is an empty dictionary.

## Changing a set

```python run add and remove
s = {1, 2, 3}
s.add(4)
s.discard(1)       # no error if missing
print(s)
```

## Set maths

```python run Union, intersection, difference
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(a | b)    # union
print(a & b)    # intersection
print(a - b)    # in a but not b
print(a ^ b)    # in one but not both
```

## Removing duplicates from a list

```python run De-duplicate
data = [3, 1, 3, 2, 1]
print(list(set(data)))          # order not guaranteed
print(sorted(set(data)))
```
