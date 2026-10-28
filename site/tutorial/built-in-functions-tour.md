Python ships with many ready-to-use **built-in functions**. A selection:

```python run Numbers and sequences
nums = [4, 8, 15, 16, 23, 42]
print(len(nums), sum(nums), min(nums), max(nums))
print(sorted(nums, reverse=True))
print(list(reversed(nums)))
print(abs(-7), round(2.567, 1), pow(2, 5))
```

## Testing values

```python run any, all, isinstance
print(any([False, True, False]))
print(all([1, 2, 3]))
print(all([]))
print(isinstance("x", str))
```

## Converting and creating

```python run Conversions
print(int("12"), float("1.5"), str(7), bool(""))
print(list(range(3)), tuple("ab"), set([1, 1, 2]))
print(chr(65), ord("A"), hex(255), bin(5))
```

## Looking things up

```python run help, dir and type
print(type(5))
print(len(dir("text")) > 40)    # many string methods
print(callable(len))
```

`print`, `input`, `open`, `enumerate`, `zip`, `map`, `filter` and `sorted` are covered in other topics. The full list is in the Python documentation under "Built-in Functions".
