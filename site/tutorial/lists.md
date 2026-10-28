A **list** holds an ordered collection of values. Lists can be changed, and they can hold values of different types.

```python run Creating and reading a list
fruits = ["apple", "banana", "cherry"]
print(fruits)
print(fruits[0])      # first item (index starts at 0)
print(fruits[-1])     # last item
print(len(fruits))
```

## Changing a list

```python run Lists are mutable
fruits = ["apple", "banana", "cherry"]
fruits[1] = "blueberry"
fruits.append("date")
print(fruits)
print("cherry" in fruits)
```

## Looping over a list

```python run Loop over a list
for fruit in ["apple", "banana", "cherry"]:
    print(fruit.upper())
```

Lists can contain lists, which is how you build tables: `grid = [[1, 2], [3, 4]]` and `grid[1][0]` is `3`.
