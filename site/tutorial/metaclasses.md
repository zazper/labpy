In Python, classes are objects too, and a **metaclass** is the class of a class. The default metaclass is `type`.

```python run Classes are objects
class A:
    pass

print(type(A), type(A()))
print(isinstance(A, type))
```

## Building a class by hand

`type(name, bases, namespace)` creates a class dynamically, which is what the `class` statement does.

```python run Dynamic class creation
def greet(self):
    return f"Hello from {type(self).__name__}"

Dog = type("Dog", (object,), {"sound": "woof", "greet": greet})
d = Dog()
print(d.sound, d.greet())
```

## A custom metaclass

A metaclass can inspect or change a class when it is created. This one registers every subclass.

```python run A registry metaclass
class RegistryMeta(type):
    registry = {}

    def __new__(mcls, name, bases, namespace):
        cls = super().__new__(mcls, name, bases, namespace)
        if bases:                                   # skip the base class itself
            RegistryMeta.registry[name.lower()] = cls
        return cls

class Model(metaclass=RegistryMeta):
    pass

class Linear(Model): pass
class Tree(Model): pass

print(sorted(RegistryMeta.registry))
print(RegistryMeta.registry["linear"]())
```

## Enforcing rules

```python run Enforce a required method
class RequiresRun(type):
    def __init__(cls, name, bases, namespace):
        super().__init__(name, bases, namespace)
        if bases and "run" not in namespace:
            raise TypeError(f"{name} must define run()")

class Task(metaclass=RequiresRun): pass

class Good(Task):
    def run(self): return "ok"

try:
    class Bad(Task): pass
except TypeError as e:
    print("TypeError:", e)
```

## Usually you do not need one

For most jobs there is something simpler:

- `__init_subclass__` hooks into subclass creation.
- Class decorators change a class after it is made.
- `abc.ABC` and `@abstractmethod` enforce required methods.
- Dataclasses and enums are already built with these tools.

```python run The simpler __init_subclass__
class Plugin:
    registry = {}

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[cls.__name__] = cls

class CsvLoader(Plugin): pass
class JsonLoader(Plugin): pass
print(list(Plugin.registry))
```

## In short

- A metaclass is the class of a class; `type` is the default. It runs when a class is created.
- Use metaclasses only for frameworks. Prefer `__init_subclass__`, class decorators or ABCs.
