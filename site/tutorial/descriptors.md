A **descriptor** is an object that customises how an attribute is read, written or deleted on another class. It defines any of `__get__`, `__set__` and `__delete__`. Properties, methods, `classmethod`, `staticmethod` and `__slots__` are all built on descriptors.

## A reusable validated attribute

```python run A validating descriptor
class Positive:
    def __set_name__(self, owner, name):
        self.name = "_" + name              # called when the class is created

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self                     # access via the class
        return getattr(obj, self.name)

    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name[1:]} must be positive, got {value}")
        setattr(obj, self.name, value)

class Position:
    quantity = Positive()
    price = Positive()

    def __init__(self, quantity, price):
        self.quantity = quantity
        self.price = price

p = Position(100, 25.5)
print(p.quantity, p.price)
try:
    p.price = -1
except ValueError as e:
    print("ValueError:", e)
```

The same descriptor is reused for several attributes, which is the advantage over writing a property for each.

## Properties are descriptors

```python run property is a descriptor
class C:
    @property
    def x(self):
        return 1

print(type(C.__dict__["x"]))
print(hasattr(C.__dict__["x"], "__get__"), hasattr(C.__dict__["x"], "__set__"))
```

## Functions are descriptors too

This is how a function becomes a **bound method**.

```python run Why methods get self
class A:
    def hello(self):
        return "hi"

a = A()
print(type(A.__dict__["hello"]))             # a plain function
print(A.__dict__["hello"].__get__(a, A)())   # __get__ binds it to the instance
print(a.hello.__self__ is a)
```

## Lookup order

When you read `obj.attr`, Python checks: a **data descriptor** on the class (one with `__set__`), then the instance dictionary, then a **non-data descriptor** (only `__get__`) or other class attribute.

```python run Data versus non-data descriptors
class NonData:
    def __get__(self, obj, t=None): return "from descriptor"

class Data(NonData):
    def __set__(self, obj, v): pass

class C:
    a = NonData()
    b = Data()

c = C()
c.__dict__["a"] = "instance"
c.__dict__["b"] = "instance"
print(c.a, "|", c.b)      # instance wins over non-data; descriptor wins when it is data
```

## A cached computed value

```python run A cache-once descriptor
class cached:
    def __init__(self, func):
        self.func = func
        self.name = func.__name__

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        value = self.func(obj)
        obj.__dict__[self.name] = value      # shadows the descriptor from now on
        return value

class Report:
    @cached
    def total(self):
        print("computing...")
        return sum(range(1000))

r = Report()
print(r.total)
print(r.total)           # no recomputation (the standard library has functools.cached_property)
```

## In short

- A descriptor implements `__get__` / `__set__` / `__delete__` and lives on the class.
- Data descriptors (with `__set__`) take priority over instance attributes. Use them for reusable validation, units or lazy loading.
- `property`, methods, `classmethod` and `functools.cached_property` are descriptors.
