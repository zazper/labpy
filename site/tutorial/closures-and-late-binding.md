A **closure** is a function that remembers variables from the scope where it was created. The catch is that it remembers the **variable**, not its value at that moment. This is called **late binding**.

## The classic surprise

```python run Late binding in a loop
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])        # [2, 2, 2], not [0, 1, 2]
```

All three lambdas share the same `i`. By the time they are called, the loop has finished and `i` is 2.

## Fix 1: bind the value with a default argument

Defaults are evaluated when the function is created.

```python run Default-argument trick
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])        # [0, 1, 2]
```

## Fix 2: functools.partial or a factory

```python run partial and factories
from functools import partial

def power(base, exp):
    return base ** exp

squares = [partial(power, exp=2)]
print(squares[0](5))

def make_adder(n):                 # each call gets its own n
    return lambda x: x + n

adders = [make_adder(n) for n in range(3)]
print([a(10) for a in adders])
```

## Looking inside a closure

```python run The closure cells
def counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = counter()
c(); c()
print(c.__closure__[0].cell_contents)     # 2
print(c.__code__.co_freevars)              # ('count',)
```

## Where it bites in analytics code

Building callbacks, column transforms or scheduled jobs in a loop is where late binding causes silent bugs.

```python run Per-column transforms
import pandas as pd

df = pd.DataFrame({"a": [1, 2], "b": [10, 20]})

wrong = {col: (lambda s: s * df[col].max()) for col in df}      # col is looked up later
right = {col: (lambda s, col=col: s * df[col].max()) for col in df}

print(wrong["a"](df["a"]).tolist())   # uses column "b" by mistake
print(right["a"](df["a"]).tolist())
```

## In short

- Closures capture variables, not values. Functions created in a loop see the variable's final value.
- Bind early with a default argument, `functools.partial` or a factory function.
- Use `nonlocal` to rebind a captured variable.
