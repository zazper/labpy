These three words are often confused. They form a chain.

- An **iterable** can produce an iterator: it has `__iter__()` (lists, strings, dicts, files, ranges).
- An **iterator** produces items one at a time: it has `__next__()`, and its `__iter__()` returns itself. It remembers where it is.
- A **generator** is an iterator created by a function with `yield` (or a generator expression). Python writes the iterator class for you.

```python run The relationship
from collections.abc import Iterable, Iterator, Generator

nums = [1, 2, 3]
print(isinstance(nums, Iterable), isinstance(nums, Iterator))    # True False

it = iter(nums)
print(isinstance(it, Iterator), iter(it) is it)                  # True True

def gen():
    yield 1
    yield 2

g = gen()
print(isinstance(g, Generator), isinstance(g, Iterator))         # True True
```

## Iterables can be reused; iterators cannot

```python run One pass only
nums = [1, 2, 3]
print(sum(nums), sum(nums))          # a list can be looped many times

it = iter(nums)
print(sum(it), sum(it))              # the second pass gets nothing: 6 0
```

A `for` loop calls `iter()` on the object, then `next()` until `StopIteration`.

## A generator that streams a large file in chunks

This reads a fixed number of lines at a time, so only one chunk is in memory.

```python run Chunked file reader
from itertools import islice

def read_in_chunks(path, lines_per_chunk=50_000):
    with open(path) as f:
        while True:
            chunk = list(islice(f, lines_per_chunk))
            if not chunk:
                return
            yield chunk

# make a test file with 200,000 lines
with open("big.txt", "w") as f:
    for i in range(200_000):
        f.write(f"{i},{i * 2}\n")

total = chunks = 0
for chunk in read_in_chunks("big.txt"):
    chunks += 1
    total += sum(int(line.split(",")[1]) for line in chunk)
print(chunks, "chunks, total", total)
```

For binary data, read fixed-size blocks with the two-argument form of `iter()`:

```python run iter(callable, sentinel)
def read_blocks(path, size=64 * 1024):
    with open(path, "rb") as f:
        yield from iter(lambda: f.read(size), b"")

open("blob.bin", "wb").write(bytes(range(256)) * 2000)
print(sum(len(block) for block in read_blocks("blob.bin")))
```

## Delegating with yield from

```python run yield from
def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item

print(list(flatten([1, [2, [3, 4]], 5])))
```

## In short

- Iterable: can give you an iterator. Iterator: gives items and remembers position. Generator: an iterator written as a function.
- Iterators are single-pass; to reuse data, keep a list or call the generator function again.
- Generators stream data with constant memory, which is how to process files larger than RAM.
