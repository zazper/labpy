Besides normal methods, a class can have two other kinds.

## Class methods

A **class method** receives the class, not an instance. It is often used as an alternative constructor.

```python run @classmethod
class Person:
    def __init__(self, name, age):
        self.name, self.age = name, age

    @classmethod
    def from_string(cls, text):
        name, age = text.split(",")
        return cls(name, int(age))

p = Person.from_string("Ada,36")
print(p.name, p.age)
```

## Static methods

A **static method** receives neither. It is just a function grouped with the class.

```python run @staticmethod
class MathTools:
    @staticmethod
    def is_even(n):
        return n % 2 == 0

print(MathTools.is_even(10))
```

## Counting instances

```python run A shared class attribute
class Widget:
    count = 0

    def __init__(self):
        Widget.count += 1

    @classmethod
    def total(cls):
        return cls.count

Widget(); Widget(); Widget()
print(Widget.total())
```
