An **if statement** runs a block of code only when a condition is true. The condition is any expression that gives `True` or `False`.

```python run Compare two numbers
a = 33
b = 200
if b > a:
    print("b is greater than a")
```

The indented lines after the colon form the block. If the condition is false, Python skips the block.

## Comparison operators

- `==` equal, `!=` not equal
- `<` less than, `>` greater than
- `<=` less than or equal, `>=` greater than or equal

```python run Checking a number
number = 15
if number > 0:
    print("The number is positive")
```

## What counts as true

Besides `True` and `False`, Python treats some values as false: `0`, an empty string, an empty list and `None`. Almost everything else is true.

```python run Truthiness
name = ""
if name:
    print("Hello,", name)
if not name:
    print("No name given")
```

## Common mistakes

- Using `=` (assignment) instead of `==` (comparison) in a condition.
- Forgetting the colon or the indentation.
