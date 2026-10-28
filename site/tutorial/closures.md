A **closure** is a function that remembers variables from the function where it was created, even after that function has finished.

```python run A counter factory
def make_counter():
    count = 0
    def counter():
        nonlocal count
        count += 1
        return count
    return counter

c1 = make_counter()
print(c1(), c1(), c1())
c2 = make_counter()
print(c2())      # separate memory
```

## Function factories

```python run Making multipliers
def multiplier(n):
    return lambda x: x * n

double = multiplier(2)
triple = multiplier(3)
print(double(10), triple(10))
```

Closures are the basis of decorators, which are the next topic.
