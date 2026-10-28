A **generator expression** looks like a list comprehension with round brackets. It produces values on demand instead of building a list.

```python run Generator expression
squares = (n * n for n in range(1, 6))
print(squares)               # a generator object, not a list
print(list(squares))
```

## Feeding functions directly

When a generator expression is the only argument, the extra brackets can be dropped.

```python run sum, max and any
print(sum(n * n for n in range(1, 101)))
print(max(len(w) for w in ["apple", "fig", "banana"]))
print(any(n > 99 for n in range(100)))
```

## List or generator?

- Use a **list** when you need to reuse the values, index them or know the length.
- Use a **generator** when you only loop once, or the data is large.

```python run Memory comparison
import sys
print(sys.getsizeof([n for n in range(100000)]))
print(sys.getsizeof(n for n in range(100000)))
```
