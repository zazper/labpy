`sorted()` returns a new sorted list from any collection. The list method `sort()` changes a list in place.

```python run sorted and sort
nums = [3, 1, 2]
print(sorted(nums))
print(nums)            # unchanged
nums.sort(reverse=True)
print(nums)
```

## Sorting by a rule with key

The `key` function tells Python what to sort by.

```python run Sort by length
words = ["banana", "fig", "apple"]
print(sorted(words, key=len))
print(sorted(words, key=str.lower, reverse=True))
```

## Sorting records

```python run Sort dictionaries and tuples
people = [("Ada", 36), ("Bob", 25), ("Cy", 30)]
print(sorted(people, key=lambda p: p[1]))

scores = {"Ada": 90, "Bob": 75, "Cy": 82}
print(sorted(scores.items(), key=lambda kv: kv[1], reverse=True))
```

Sorting is **stable**: equal items keep their original order, so you can sort by one key and then another.
