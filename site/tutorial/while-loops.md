A `while` loop repeats as long as its condition is true.

```python run Counting with while
count = 1
while count <= 5:
    print(count)
    count += 1
```

Make sure something inside the loop changes the condition, or it will run forever. (LabPy's Stop button ends a runaway loop.)

## Loop until a goal

```python run Doubling until large
amount = 1
steps = 0
while amount < 1000:
    amount *= 2
    steps += 1
print(amount, steps)
```

## Infinite loop with break

`while True` runs until you `break` out of it.

```python run while True and break
n = 0
while True:
    n += 3
    if n > 10:
        break
print(n)
```
