Every value in Python has a **type**. The type decides what you can do with the value.

- `int`: whole numbers, `float`: decimal numbers, `complex`: complex numbers
- `str`: text, `bool`: `True` or `False`
- `list`, `tuple`, `set`, `dict`: collections of values
- `NoneType`: the single value `None`, meaning "nothing"

```python run Checking types
print(type(42))
print(type(3.14))
print(type("hello"))
print(type(True))
print(type([1, 2, 3]))
print(type({"a": 1}))
print(type(None))
```

## isinstance()

`isinstance(value, type)` tells you whether a value is of a given type.

```python run isinstance
x = 10
print(isinstance(x, int))
print(isinstance(x, str))
print(isinstance(True, int))   # bool is a kind of int
```

Python is **dynamically typed**: a variable can refer to a value of any type, and the type belongs to the value, not the name.
