Every module has a built-in name `__name__`. When you run a file directly, its `__name__` is `"__main__"`. When another file imports it, `__name__` is the module's name.

```python run The main check
def main():
    print("Running as the main program")

if __name__ == "__main__":
    main()
```

## Why it matters

Code under this check runs only when the file is run directly, not when it is imported. This lets one file work as both a program and a library.

```python run Seeing __name__
print("__name__ is", __name__)
```

A common pattern:

```python static Pattern
def useful_function():
    ...

if __name__ == "__main__":
    # quick tests or the program's entry point
    print(useful_function())
```
