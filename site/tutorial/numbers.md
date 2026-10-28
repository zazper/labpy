Python has three number types: `int` (whole numbers of any size), `float` (decimals) and `complex`.

```python run Basic arithmetic
print(7 + 3)     # addition
print(7 - 3)     # subtraction
print(7 * 3)     # multiplication
print(7 / 2)     # division always gives a float
print(7 // 2)    # floor division
print(7 % 2)     # remainder
print(2 ** 10)   # power
```

## Useful functions

```python run abs, round and divmod
print(abs(-5))
print(round(3.14159, 2))
print(divmod(17, 5))      # (quotient, remainder)
print(2 ** 100)           # integers can be huge
```

## Float precision

Decimals are stored in binary, so some values are not exact. Use `round()` for display, or the `decimal` module when exactness matters.

```python run Floating point surprise
print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
```

The `math` module adds more: `math.sqrt()`, `math.pi`, `math.floor()` and many others.

```python run The math module
import math
print(math.sqrt(16), math.pi, math.floor(2.7), math.ceil(2.1))
```
