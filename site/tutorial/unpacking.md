**Unpacking** assigns the items of a sequence to several names at once.

```python run Basic unpacking
x, y = (10, 20)
name, age, city = ["Ada", 36, "London"]
print(x, y)
print(name, age, city)
```

## Swapping values

```python run Swap
a, b = 1, 2
a, b = b, a
print(a, b)
```

## Collecting the rest with *

```python run Star unpacking
first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)
```

## Unpacking in loops and calls

```python run Unpacking pairs
pairs = [("a", 1), ("b", 2)]
for letter, number in pairs:
    print(letter, number)

def add(x, y):
    return x + y

print(add(*[3, 4]))     # unpack a list into arguments
```

The number of names must match the number of values, unless you use a starred name.
