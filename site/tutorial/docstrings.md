A **docstring** is a string placed first in a function, class or module to describe it. Tools and `help()` read it.

```python run A docstring
def area(width, height):
    """Return the area of a rectangle."""
    return width * height

print(area.__doc__)
help(area)
```

## A fuller docstring

```python run Multi-line docstring
def divide(a, b):
    """Divide a by b.

    Args:
        a: the numerator.
        b: the denominator, which must not be zero.

    Returns:
        The result of a / b.
    """
    return a / b

print(divide.__doc__)
```

Good docstrings say **what** the function does, what the parameters mean and what it returns. Use triple double quotes.
