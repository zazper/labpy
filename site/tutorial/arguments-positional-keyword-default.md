Arguments can be passed in several ways.

```python run Positional and keyword arguments
def describe(name, age):
    print(f"{name} is {age}")

describe("Ada", 36)             # by position
describe(age=36, name="Ada")    # by name
```

## Default values

```python run Default values
def power(base, exponent=2):
    return base ** exponent

print(power(5))
print(power(2, 10))
```

## Keyword-only and positional-only

A `*` in the parameter list forces the rest to be named. A `/` makes the ones before it positional only.

```python run Keyword-only arguments
def connect(host, *, port=80, secure=False):
    return f"{host}:{port} secure={secure}"

print(connect("example.com", port=443, secure=True))
```

## A classic trap

Do not use a list or dictionary as a default value. It is created once and shared by every call.

```python run Mutable default surprise
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("a"))
print(add_item("b"))     # the same list again!

def add_item_safe(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item_safe("a"), add_item_safe("b"))
```
