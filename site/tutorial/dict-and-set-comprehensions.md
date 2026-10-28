The same idea builds dictionaries and sets using curly braces.

## Dictionary comprehensions

`{key: value for item in sequence}`

```python run Dict comprehension
squares = {n: n * n for n in range(1, 6)}
print(squares)

words = ["apple", "fig", "banana"]
print({w: len(w) for w in words})
```

## Swapping keys and values

```python run Invert a dictionary
d = {"a": 1, "b": 2}
print({v: k for k, v in d.items()})
```

## Set comprehensions

```python run Set comprehension
text = "mississippi"
print({ch for ch in text})
print({n % 3 for n in range(20)})
```

## Filtering a dictionary

```python run Filter a dictionary
prices = {"apple": 0.5, "melon": 3.0, "pear": 0.75}
print({k: v for k, v in prices.items() if v < 1})
```
