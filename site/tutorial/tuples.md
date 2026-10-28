A **tuple** is like a list that cannot be changed. Use round brackets.

```python run Creating tuples
point = (3, 4)
print(point[0], point[1])
print(len(point))
single = (5,)       # one item needs a trailing comma
print(type(single))
```

## Why use a tuple?

- Fixed groups of values, such as coordinates or RGB colours.
- Returning several values from a function.
- Dictionary keys (lists cannot be keys).

```python run Tuples cannot change error
point = (3, 4)
point[0] = 10
```

## Tuple methods

Tuples only have `count()` and `index()`.

```python run Tuple methods
t = (1, 2, 2, 3)
print(t.count(2), t.index(3))
```
