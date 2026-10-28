**Slicing** takes part of a sequence. The pattern is `[start:stop:step]`. The `stop` position is not included.

```python run Basic slices
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(nums[2:5])
print(nums[:3])      # from the start
print(nums[7:])      # to the end
print(nums[::2])     # every second item
```

## Negative numbers count from the end

```python run Negative indexes
nums = [0, 1, 2, 3, 4, 5]
print(nums[-1])
print(nums[-3:])
print(nums[::-1])    # reversed copy
```

## Strings and tuples slice too

```python run Slicing text
word = "Python"
print(word[:2], word[2:], word[::-1])
```

Slices never raise an error for out-of-range positions; they just return what exists.
