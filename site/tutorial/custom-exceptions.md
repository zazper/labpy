Make your own exception by inheriting from `Exception`. A clear name makes errors easier to understand and catch.

```python run A custom exception
class InsufficientFunds(Exception):
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFunds(f"need {amount - balance} more")
    return balance - amount

try:
    withdraw(10, 25)
except InsufficientFunds as e:
    print("Failed:", e)
```

## Adding data

```python run Exception with extra data
class ValidationError(Exception):
    def __init__(self, field, message):
        super().__init__(f"{field}: {message}")
        self.field = field

try:
    raise ValidationError("email", "must contain @")
except ValidationError as e:
    print(e, "| field =", e.field)
```

## A family of errors

```python run Base exception for a library
class AppError(Exception): pass
class NotFound(AppError): pass

try:
    raise NotFound("item 7")
except AppError as e:
    print("Caught by the base class:", e)
```
