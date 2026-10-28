A **method** is a function defined inside a class. It can read and change the object's attributes through `self`.

```python run Methods that change state
class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Not enough money")
        else:
            self.balance -= amount

acct = BankAccount(100)
acct.deposit(50)
acct.withdraw(500)
acct.withdraw(30)
print(acct.balance)
```

## Methods can call each other

```python run Calling another method
class Greeter:
    def name(self):
        return "Ada"

    def greet(self):
        return f"Hello, {self.name()}!"

print(Greeter().greet())
```

## Class attributes

An attribute set on the class itself is shared by all instances.

```python run Class attribute
class Circle:
    pi = 3.14159

    def __init__(self, r):
        self.r = r

    def area(self):
        return Circle.pi * self.r ** 2

print(Circle(2).area())
```
