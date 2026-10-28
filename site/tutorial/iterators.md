An **iterable** is anything you can loop over. An **iterator** is the object that hands out the items one at a time. `iter()` gets an iterator and `next()` asks for the next item.

```python run Using iter and next
it = iter([10, 20, 30])
print(next(it))
print(next(it))
print(next(it))
```

When no items are left, `next()` raises `StopIteration`. A `for` loop uses this behind the scenes and stops quietly.

```python run Running out of items error
it = iter([1])
print(next(it))
print(next(it))
```

## Your own iterator

A class becomes an iterator by defining `__iter__` and `__next__`.

```python run A custom iterator
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

print(list(Countdown(5)))
```

Generators (next topic) are an easier way to write iterators.
