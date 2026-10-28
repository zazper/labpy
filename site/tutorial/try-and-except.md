When something goes wrong, Python raises an **exception** and the program stops. `try` and `except` let you handle it.

```python run Without handling error
number = int("abc")
print("not reached")
```

```python run Handling an exception
try:
    number = int("abc")
except ValueError:
    print("That is not a number")
print("The program keeps going")
```

## Catching specific errors

```python run Several except blocks
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "cannot divide by zero"
    except TypeError:
        return "numbers only"

print(safe_divide(10, 2))
print(safe_divide(1, 0))
print(safe_divide("a", 1))
```

## Getting the error message

```python run as e
try:
    [1, 2, 3][10]
except IndexError as e:
    print("Problem:", e)
```

Catch specific exceptions. A bare `except:` hides bugs, including typing mistakes.
