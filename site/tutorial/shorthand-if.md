For a simple choice you can write the whole `if` on one line.

```python run One-line if
x = 7
if x > 5: print("big")
```

## The conditional expression

`value_if_true if condition else value_if_false` produces a value, which makes it handy in assignments.

```python run Conditional expression
age = 20
status = "adult" if age >= 18 else "minor"
print(status)
print("even" if 10 % 2 == 0 else "odd")
```

## Defaults with or

`or` returns the first true value, a common shortcut for default values.

```python run Default values
name = ""
print(name or "Guest")
```

Use the one-line forms only when they stay easy to read. For anything longer, use a normal `if` block.
