A **boolean** is either `True` or `False`. Comparisons produce booleans.

```python run Booleans from comparisons
print(5 > 3)
print(5 == 3)
print("a" in "cat")
print(type(True))
```

## Truthiness

`bool()` shows how Python treats any value in a condition. Empty or zero values are false; almost everything else is true.

```python run What is true or false
for value in [0, 1, "", "text", [], [0], None]:
    print(repr(value), "->", bool(value))
```

## None

`None` is a special value meaning "no value". Test for it with `is`, not `==`.

```python run Using None
result = None
if result is None:
    print("No result yet")
```

Functions that do not return anything give back `None`.
