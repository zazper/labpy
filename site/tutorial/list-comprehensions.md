A **list comprehension** builds a list in one readable line: `[expression for item in sequence if condition]`.

```python run Squares
squares = [n * n for n in range(1, 6)]
print(squares)
```

It is the short form of this loop:

```python run The same with a loop
squares = []
for n in range(1, 6):
    squares.append(n * n)
print(squares)
```

## Filtering

Add an `if` to keep only some items.

```python run Filtering
evens = [n for n in range(10) if n % 2 == 0]
words = ["apple", "fig", "banana"]
long_words = [w.upper() for w in words if len(w) > 3]
print(evens, long_words)
```

## Choosing a value per item

```python run Conditional expression inside
labels = ["even" if n % 2 == 0 else "odd" for n in range(5)]
print(labels)
```

## Two loops

```python run Nested loops
pairs = [(x, y) for x in range(3) for y in range(2)]
print(pairs)
```

Keep comprehensions short. If one gets hard to read, use a normal loop.
