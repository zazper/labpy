**Polymorphism** means different classes can offer the same method, so code can treat them alike without checking their type.

```python run Same method, different behaviour
class Circle:
    def __init__(self, r):
        self.r = r
    def area(self):
        return 3.14159 * self.r ** 2

class Square:
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2

shapes = [Circle(1), Square(2), Circle(0.5)]
for shape in shapes:
    print(type(shape).__name__, round(shape.area(), 2))
```

## Duck typing

Python cares about what an object can **do**, not what class it is: "if it walks like a duck and quacks like a duck, it is a duck".

```python run Duck typing
class Robot:
    def speak(self):
        return "Beep"

class Parrot:
    def speak(self):
        return "Hello!"

for thing in [Robot(), Parrot()]:
    print(thing.speak())
```

Built-ins work this way too: `len()` works on anything that has a length.
