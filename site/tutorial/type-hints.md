**Type hints** describe the types a function expects and returns. Python does not enforce them at run time, but editors and tools like mypy use them to catch mistakes.

```python run Type hints
def add(a: int, b: int) -> int:
    return a + b

def greet(name: str, excited: bool = False) -> str:
    return f"Hello, {name}{'!' if excited else '.'}"

print(add(2, 3))
print(greet("Ada", excited=True))
```

## Hinting collections

```python run Collections and optional values
def average(numbers: list[float]) -> float:
    return sum(numbers) / len(numbers)

def find(items: list[str], target: str) -> int | None:
    return items.index(target) if target in items else None

print(average([1.0, 2.0, 4.5]))
print(find(["a", "b"], "z"))
```

Hints are ignored when the program runs, so this still works:

```python run Hints are not enforced
def double(x: int) -> int:
    return x * 2

print(double("ab"))
```

Use `X | None` for optional values, and `list[int]`, `dict[str, int]` and `tuple[int, str]` for containers.
