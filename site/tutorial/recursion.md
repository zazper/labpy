A **recursive** function calls itself. It needs a **base case** that stops the recursion.

```python run Factorial
def factorial(n):
    if n <= 1:          # base case
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

## Another example

```python run Fibonacci
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(10)])
```

## Remember results with a cache

This version of `fib` repeats work. A cache remembers answers so it stays fast.

```python run Caching with lru_cache
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(80))
```

## Depth limit

Python stops runaway recursion after about a thousand calls with a `RecursionError`. For deep problems, use a loop.
