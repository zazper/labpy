**Casting** converts a value from one type to another using the type's name as a function.

```python run Converting types
print(int("42") + 1)      # str to int
print(float("3.5"))       # str to float
print(str(100) + " items")  # int to str
print(int(7.9))           # float to int cuts off the decimals
print(bool(0), bool(5))   # numbers to bool
print(list("abc"))        # str to list
print(tuple([1, 2, 3]))   # list to tuple
```

## When conversion fails

Converting text that is not a valid number raises a `ValueError`.

```python run A failed conversion error
number = int("hello")
```

Use `try` and `except` to handle this safely (see the Errors topics).
