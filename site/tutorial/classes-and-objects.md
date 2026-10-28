A **class** is a blueprint for creating **objects**. An object bundles data (attributes) with behaviour (methods).

```python run A first class
class Dog:
    sound = "Woof"

    def speak(self):
        print(self.sound)

rex = Dog()        # create an object (an instance)
rex.speak()
print(type(rex))
```

## Many objects, one class

```python run Several instances
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1

a = Counter()
b = Counter()
a.increment(); a.increment()
b.increment()
print(a.value, b.value)
```

Each object has its own attributes. Everything in Python is an object: numbers, strings and functions all have types and methods.
