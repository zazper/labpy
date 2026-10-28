A **function** is a named block of code you can run whenever you need it. Define it with `def`.

```python run Defining and calling
def greet():
    print("Hello!")

greet()
greet()
```

## Parameters

Parameters let you pass information in.

```python run Parameters
def greet(name):
    print(f"Hello, {name}!")

greet("Ada")
greet("Bob")
```

## Returning a value

`return` sends a result back to the caller.

```python run return
def square(n):
    return n * n

result = square(6)
print(result)
print(square(2) + square(3))
```

A function without `return` gives back `None`. Functions help you avoid repeating code and give pieces of your program clear names.
