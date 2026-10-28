**Inheritance** lets a class reuse and extend another. The new class (child) gets everything from the parent.

```python run A child class
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):          # override
        return "Woof"

class Cat(Animal):
    def speak(self):
        return "Meow"

for pet in [Dog("Rex"), Cat("Tom"), Animal("Thing")]:
    print(pet.name, pet.speak())
```

## Calling the parent with super()

```python run super()
class Vehicle:
    def __init__(self, wheels):
        self.wheels = wheels

class Car(Vehicle):
    def __init__(self, brand):
        super().__init__(4)
        self.brand = brand

car = Car("Mini")
print(car.brand, car.wheels)
```

## Checking relationships

```python run isinstance and issubclass
class Vehicle: pass
class Car(Vehicle): pass

car = Car()
print(isinstance(car, Car), isinstance(car, Vehicle))
print(issubclass(Car, Vehicle))
```
