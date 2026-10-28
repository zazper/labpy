A **generator** is a function that produces values one at a time using `yield`, instead of building a whole list. It pauses at each `yield` and continues from there next time.

```python run A generator function
def count_up(limit):
    n = 1
    while n <= limit:
        yield n
        n += 1

for number in count_up(5):
    print(number)
```

## Why generators?

They use almost no memory, even for huge sequences, because values are made on demand.

```python run Memory-friendly sequence
def squares(n):
    for i in range(n):
        yield i * i

total = sum(squares(1_000_000))
print(total)
```

## Infinite sequences

```python run An infinite generator
def naturals():
    n = 0
    while True:
        yield n
        n += 1

gen = naturals()
print([next(gen) for _ in range(5)])
```

## Processing a big file lazily

A generator can read a large file one line at a time, so only one line is in memory at once. This is the idea behind streaming large files.

```python run A line-by-line pipeline
def numbered(lines):
    for i, line in enumerate(lines, 1):
        yield f"{i}: {line}"

for row in numbered(["first", "second", "third"]):
    print(row)
```

A generator can be used only once. Call the function again for a fresh one.
