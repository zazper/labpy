Combine conditions with `and`, `or` and `not`.

```python run and, or, not
age = 25
has_ticket = True
print(age >= 18 and has_ticket)
print(age < 13 or age > 65)
print(not has_ticket)
```

## Short-circuiting

Python stops as soon as the answer is known. In `a and b`, if `a` is false then `b` is never checked. This lets you guard against errors.

```python run Short-circuit guard
items = []
if items and items[0] == "x":
    print("first is x")
else:
    print("nothing to check")
```

## Chained comparisons

```python run Chained comparison
x = 15
print(1 < x < 20)
if 10 <= x <= 20:
    print("in range")
```

Use parentheses when mixing `and` and `or`, because `and` is evaluated first.
