`__init__` is the **constructor**. Python runs it when you create an object, so it is the place to set up attributes. `self` is the object being created.

```python run The constructor
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

ada = Person("Ada", 36)
print(ada.name, ada.age)
```

## self

Every method receives the object as its first parameter, conventionally called `self`. Python passes it automatically, so you do not write it when calling.

```python run Using self in methods
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

r = Rectangle(3, 4)
print(r.area())
```

## Default values

```python run Defaults in __init__
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

print(Account("Ada").balance, Account("Bob", 50).balance)
```
