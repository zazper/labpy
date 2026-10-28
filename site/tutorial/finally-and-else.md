Two more parts complete the `try` statement.

- `else` runs only if **no** exception happened.
- `finally` runs **always**, whether or not there was an error. It is used for clean-up.

```python run else and finally
def read_number(text):
    try:
        value = int(text)
    except ValueError:
        print("Not a number:", text)
    else:
        print("Got", value)
    finally:
        print("Done with", repr(text))

read_number("42")
read_number("abc")
```

## Clean-up that must happen

```python run finally with a return
def demo():
    try:
        return "from try"
    finally:
        print("cleanup runs before returning")

print(demo())
```

For files and other resources the `with` statement (see Context managers) is usually neater than `finally`.
