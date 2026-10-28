Dictionaries have methods for the common jobs.

```python run keys, values and items
d = {"a": 1, "b": 2, "c": 3}
print(list(d.keys()))
print(list(d.values()))
print(list(d.items()))
```

## Updating and merging

```python run update and the | operator
a = {"x": 1, "y": 2}
b = {"y": 20, "z": 30}
a.update(b)
print(a)
print({"p": 1} | {"q": 2})    # merge into a new dictionary
```

## Defaults and removal

```python run setdefault and pop
counts = {}
for word in ["a", "b", "a"]:
    counts[word] = counts.get(word, 0) + 1
print(counts)

d = {"k": 1, "j": 2}
print(d.pop("k"))
print(d.setdefault("m", 99), d)
```

For counting, `collections.Counter` and `collections.defaultdict` (see the Standard library tour) are even shorter.
