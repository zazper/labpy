An **enum** is a set of named constants. Use it instead of loose strings or numbers, so values cannot be mistyped.

```python run An enum
from enum import Enum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

print(Color.RED)
print(Color.RED.name, Color.RED.value)
print(Color(2))
```

## Looping and comparing

```python run Iterating members
from enum import Enum

class Day(Enum):
    MON = 1
    TUE = 2

for d in Day:
    print(d.name, d.value)

today = Day.MON
print(today is Day.MON, today == Day.TUE)
```

## Auto values

```python run auto() and StrEnum
from enum import Enum, auto, StrEnum

class Level(Enum):
    LOW = auto()
    HIGH = auto()

class Mode(StrEnum):
    READ = "read"
    WRITE = "write"

print(Level.HIGH.value, Mode.READ == "read")
```
