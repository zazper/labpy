Three tools change how a loop runs.

- `break` leaves the loop immediately.
- `continue` skips to the next round.
- `else` on a loop runs if the loop finished without hitting `break`.

```python run break
for n in range(1, 10):
    if n == 4:
        break
    print(n)
```

```python run continue
for n in range(1, 8):
    if n % 2 == 0:
        continue
    print(n)
```

## Loop else

The `else` part is useful for searches.

```python run for-else
numbers = [3, 5, 7, 9]
for n in numbers:
    if n % 2 == 0:
        print("Found an even number:", n)
        break
else:
    print("No even numbers")
```

`break` and `continue` only affect the innermost loop.
