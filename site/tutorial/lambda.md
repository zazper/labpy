A **lambda** is a small anonymous function written on one line: `lambda parameters: expression`.

```python run A lambda
double = lambda x: x * 2
print(double(21))

add = lambda a, b: a + b
print(add(2, 3))
```

## Where lambdas shine

They are most useful as short throw-away functions passed to other functions.

```python run Lambdas as keys
people = [("Ada", 36), ("Bob", 25), ("Cy", 30)]
print(sorted(people, key=lambda p: p[1]))
print(max(people, key=lambda p: p[1]))
```

```python run map and filter
nums = [1, 2, 3, 4, 5, 6]
print(list(map(lambda x: x * x, nums)))
print(list(filter(lambda x: x % 2 == 0, nums)))
```

A lambda can only contain one expression. If you need more, use `def`. List comprehensions are often clearer than `map` and `filter`.
