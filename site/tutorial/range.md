`range()` produces a sequence of numbers, most often used in `for` loops.

```python run range basics
for i in range(5):
    print(i, end=" ")
print()
for i in range(2, 6):
    print(i, end=" ")
print()
for i in range(0, 10, 3):
    print(i, end=" ")
```

- `range(stop)` counts from 0 up to, but not including, `stop`.
- `range(start, stop)` starts at `start`.
- `range(start, stop, step)` jumps by `step`, which can be negative.

```python run Counting down
for i in range(5, 0, -1):
    print(i)
print("Liftoff!")
```

## It is lazy

`range` does not build a list. Use `list()` to see the values.

```python run list(range)
print(list(range(1, 11)))
print(sum(range(1, 101)))
print(len(range(1000000)))
```

To loop over a list by position, use `range(len(items))`, or better, `enumerate()`.
