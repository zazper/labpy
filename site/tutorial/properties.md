A **property** looks like a plain attribute but runs a method. It lets you add checks or calculate values without changing how the class is used.

```python run A computed property
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height

r = Rectangle(3, 4)
print(r.area)       # no brackets
```

## Validation with a setter

```python run A property with a setter
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value

t = Temperature(20)
t.celsius = 25
print(t.celsius)
```

By convention, a leading underscore (`_celsius`) marks an attribute as internal to the class.
