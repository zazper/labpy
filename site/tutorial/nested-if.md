You can put an `if` inside another `if`. Each level is indented further.

```python run Nested if
age = 30
has_license = True

if age >= 18:
    if has_license:
        print("You can drive")
    else:
        print("Get a license first")
else:
    print("Too young")
```

## Flattening with and

Deep nesting is hard to read. Often one combined condition says the same thing.

```python run Same logic, flatter
age = 30
has_license = True
if age >= 18 and has_license:
    print("You can drive")
elif age >= 18:
    print("Get a license first")
else:
    print("Too young")
```

A good rule: if you need more than two or three levels, consider a function or `elif` chain.
