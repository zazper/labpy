Lists have methods that change them in place.

```python run Adding items
nums = [1, 2, 3]
nums.append(4)          # add to the end
nums.insert(0, 0)       # add at a position
nums.extend([5, 6])     # add several
print(nums)
```

## Removing items

```python run Removing items
nums = [10, 20, 30, 20, 40]
nums.remove(20)         # removes the first 20
last = nums.pop()       # removes and returns the last item
print(nums, last)
nums.clear()
print(nums)
```

## Searching and ordering

```python run index, count, sort, reverse
letters = ["d", "a", "c", "b"]
print(letters.index("c"))
print(letters.count("a"))
letters.sort()
print(letters)
letters.reverse()
print(letters)
```

Methods like `sort()` and `append()` change the list and return `None`, so do not write `x = x.sort()`.
