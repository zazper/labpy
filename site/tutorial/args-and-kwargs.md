Two special parameters let a function accept any number of arguments.

- `*args` collects extra positional arguments into a **tuple**.
- `**kwargs` collects extra named arguments into a **dictionary**.

```python run args
def total(*args):
    print(args)
    return sum(args)

print(total(1, 2, 3, 4))
```

```python run kwargs
def show(**kwargs):
    for key, value in kwargs.items():
        print(f"{key} = {value}")

show(name="Ada", age=36)
```

## Passing them on

A star in a call **unpacks** a list, and two stars unpack a dictionary.

```python run Unpacking in a call
def intro(name, age):
    print(name, age)

intro(*["Ada", 36])
intro(**{"name": "Bob", "age": 25})
```

Names like `args` and `kwargs` are just conventions; the stars are what matter.
