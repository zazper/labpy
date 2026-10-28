A `for` loop goes through the items of a sequence, one at a time.

```python run Looping over a list
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)
```

## Strings, dictionaries and more

```python run Loop over a string and a dictionary
for ch in "abc":
    print(ch)

ages = {"Ada": 36, "Bob": 25}
for name, age in ages.items():
    print(name, age)
```

## Building a result

```python run Adding up numbers
total = 0
for n in [4, 8, 15, 16, 23, 42]:
    total += n
print("Total:", total)
```

## Nested loops

```python run A multiplication table
for i in range(1, 4):
    for j in range(1, 4):
        print(i * j, end="\t")
    print()
```

Use `for` when you know what to loop over, and `while` when you loop until something happens.
