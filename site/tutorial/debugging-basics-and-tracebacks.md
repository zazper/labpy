When code crashes, Python prints a **traceback**: the chain of calls that led to the error. Read it from the **bottom**: the last line says what went wrong, and the lines above show where.

```python run Reading a traceback error
def add_tax(price):
    return price * rate      # rate is not defined

def checkout(items):
    return sum(add_tax(p) for p in items)

print(checkout([10, 20]))
```

## Debugging tools

- `print()` values at key points. Use `print(f"{x = }")` for a quick label.
- Check types with `type(x)` and contents with `repr(x)`.
- Simplify: shrink the code until the problem is small.
- Run **Check** in LabPy to spot unused or undefined names before running.

```python run Debugging with print
def total(prices):
    result = 0
    for p in prices:
        print(f"{p = }, {result = }")
        result += p
    return result

print(total([5, 10, 15]))
```

## Common errors and meanings

- `SyntaxError`: the code is not valid Python (missing colon, bracket or quote).
- `NameError`: a name is used before it is defined, or misspelled.
- `TypeError`: an operation was used on the wrong type.
- `IndexError` and `KeyError`: a position or key does not exist.
- `IndentationError`: lines are not lined up properly.
