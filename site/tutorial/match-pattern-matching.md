`match` compares a value against **patterns** and runs the first that fits. It needs Python 3.10 or newer, which LabPy has.

```python run Matching values
command = "stop"
match command:
    case "go":
        print("Going")
    case "stop" | "halt":
        print("Stopping")
    case _:
        print("Unknown command")
```

The `_` case matches anything, like `else`. The `|` joins alternatives.

## Capturing parts

```python run Matching sequences
point = (0, 5)
match point:
    case (0, 0):
        print("origin")
    case (0, y):
        print("on the y axis at", y)
    case (x, 0):
        print("on the x axis at", x)
    case _:
        print("somewhere else")
```

## Guards and dictionaries

```python run Guards and dict patterns
def describe(data):
    match data:
        case {"type": "circle", "r": r} if r > 10:
            return "big circle"
        case {"type": "circle"}:
            return "circle"
        case [first, *rest]:
            return f"list starting with {first}"
        case _:
            return "something else"

print(describe({"type": "circle", "r": 20}))
print(describe({"type": "circle", "r": 2}))
print(describe([1, 2, 3]))
```
