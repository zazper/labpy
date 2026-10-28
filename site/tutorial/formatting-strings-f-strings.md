**f-strings** put values straight into text. Start the string with `f` and write expressions in curly braces.

```python run f-strings
name = "Ada"
age = 36
print(f"{name} is {age} years old")
print(f"Next year: {age + 1}")
print(f"Shouting: {name.upper()}")
```

## Formatting numbers

After a colon you can control the format.

```python run Format specifiers
pi = 3.14159265
n = 1234567
print(f"{pi:.2f}")       # 2 decimal places
print(f"{n:,}")          # thousands separator
print(f"{0.256:.1%}")    # percent
print(f"{42:05d}")       # pad with zeros
```

## Alignment

```python run Alignment
for name, score in [("Ada", 95), ("Bob", 8)]:
    print(f"{name:<8}{score:>5}")
```

## Debugging with =

```python run The = shortcut
x = 10
print(f"{x = }")
print(f"{x * 2 = }")
```
