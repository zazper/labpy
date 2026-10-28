Two built-ins make loops tidier.

## enumerate()

`enumerate()` gives you the position and the item together.

```python run enumerate
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(i, fruit)
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")
```

## zip()

`zip()` walks through several sequences at the same time and stops at the shortest.

```python run zip
names = ["Ada", "Bob", "Cy"]
scores = [90, 75, 82]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

## Building a dictionary

```python run zip into a dict
keys = ["a", "b", "c"]
values = [1, 2, 3]
print(dict(zip(keys, values)))
print(list(zip(*[(1, "x"), (2, "y")])))   # unzip
```
