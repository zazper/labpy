**mypy** is a static type checker. It reads your type hints and finds mistakes without running the code.

```python static example.py
def double(x: int) -> int:
    return x * 2

double("ab")        # mypy: Argument 1 has incompatible type "str"; expected "int"
```

On your own computer:

```bash static Install and run
pip install mypy
mypy example.py
```

## What it catches

- Passing the wrong type to a function.
- Returning a value that does not match the declared type.
- Using a value that might be `None` without checking.

```python static Optional values
def first_word(text: str | None) -> str:
    return text.split()[0]      # mypy: "None" has no attribute "split"

def safe_first_word(text: str | None) -> str:
    if text is None:
        return ""
    return text.split()[0]
```

mypy is not installed in LabPy yet. Start by adding hints (see the Type hints topic); editors such as VS Code also check them for you.
