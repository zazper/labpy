Use `raise` to signal a problem yourself.

```python run Raising and catching
def set_age(age):
    if age < 0:
        raise ValueError("age cannot be negative")
    return age

try:
    set_age(-5)
except ValueError as e:
    print("Caught:", e)
```

## Choosing the exception type

- `ValueError`: the value is wrong.
- `TypeError`: the type is wrong.
- `KeyError` and `IndexError`: missing key or position.
- `NotImplementedError`: a placeholder for code not written yet.

## Re-raising and chaining

```python run raise from
try:
    try:
        int("x")
    except ValueError as e:
        raise RuntimeError("could not read the setting") from e
except RuntimeError as e:
    print(e, "| caused by:", repr(e.__cause__))
```

A bare `raise` inside an `except` block re-raises the current exception after you log it.
