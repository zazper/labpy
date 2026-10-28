An **assertion** checks that something you believe is true. If it is false, Python raises `AssertionError`. Use assertions to catch your own mistakes during development.

```python run assert
def average(numbers):
    assert len(numbers) > 0, "need at least one number"
    return sum(numbers) / len(numbers)

print(average([2, 4, 6]))
```

```python run A failed assertion error
def average(numbers):
    assert len(numbers) > 0, "need at least one number"
    return sum(numbers) / len(numbers)

print(average([]))
```

## Assertions vs exceptions

- Use `assert` for conditions that **should never** be false in correct code.
- Use `raise` for bad input from users or other systems.

Python can be run with assertions switched off (`python -O`), so never rely on them for validation.
