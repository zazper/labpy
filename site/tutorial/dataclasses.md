A **dataclass** writes the boring parts of a class for you: `__init__`, `__repr__` and `__eq__`.

```python run A dataclass
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(1.5, 2.5)
print(p)
print(p == Point(1.5, 2.5))
```

## Defaults and methods

```python run Defaults and methods
from dataclasses import dataclass, field

@dataclass
class Student:
    name: str
    grades: list = field(default_factory=list)
    active: bool = True

    def average(self):
        return sum(self.grades) / len(self.grades) if self.grades else 0

s = Student("Ada", [90, 80])
print(s, s.average())
```

## Immutable and sortable

```python run frozen and order
from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Version:
    major: int
    minor: int

print(Version(1, 2) < Version(1, 10))
print(sorted([Version(2, 0), Version(1, 5)]))
```

Use `field(default_factory=list)` for lists and dictionaries, never a plain `[]` default.
