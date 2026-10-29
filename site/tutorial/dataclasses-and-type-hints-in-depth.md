Dataclasses and type hints together give you clear, self-checking data structures with very little code.

## Dataclass options that matter

```python run frozen, slots and ordering
from dataclasses import dataclass

@dataclass(frozen=True, slots=True, order=True)
class Position:
    ticker: str
    quantity: int
    price: float

p = Position("AAPL", 100, 190.5)
print(p)
print(p < Position("MSFT", 1, 1.0))
try:
    p.quantity = 5
except Exception as e:
    print(type(e).__name__)
```

- `frozen=True`: instances cannot be changed, and they become hashable.
- `slots=True`: less memory and no accidental new attributes.
- `order=True`: adds `<`, `>` and friends, comparing fields in order.
- `kw_only=True` (or a `KW_ONLY` marker): fields must be given by name.

## Validation and derived fields

```python run __post_init__ and field()
from dataclasses import dataclass, field

@dataclass
class Bond:
    isin: str
    coupon: float
    face: float = 100.0
    cashflows: list = field(default_factory=list, repr=False)
    notional: float = field(init=False)

    def __post_init__(self):
        if not 0 <= self.coupon < 1:
            raise ValueError(f"coupon must be a fraction between 0 and 1, got {self.coupon}")
        self.notional = self.face * 10

print(Bond("US1", 0.05))
try:
    Bond("US2", 5)
except ValueError as e:
    print("ValueError:", e)
```

## Updating immutable objects

```python run replace and asdict
from dataclasses import dataclass, replace, asdict

@dataclass(frozen=True)
class Order:
    id: int
    qty: int

o = Order(1, 10)
o2 = replace(o, qty=20)          # a modified copy
print(o, o2)
print(asdict(o2))
```

## Type hints that earn their keep

Hints are not checked when the program runs, but tools (mypy, editors) and documentation use them.

```python run Literal, TypedDict and Protocol
from typing import Literal, TypedDict, Protocol, Optional

Side = Literal["buy", "sell"]

class Quote(TypedDict):
    symbol: str
    bid: float
    ask: float

class HasPrice(Protocol):
    def price(self) -> float: ...

def mid(q: Quote) -> float:
    return (q["bid"] + q["ask"]) / 2

def execute(side: Side, qty: int, limit: Optional[float] = None) -> str:
    return f"{side} {qty}" + (f" @ {limit}" if limit else " at market")

class Bondish:
    def price(self) -> float:
        return 99.5

def show(x: HasPrice) -> float:
    return x.price()

print(mid({"symbol": "A", "bid": 99.0, "ask": 101.0}))
print(execute("buy", 10, 99.5))
print(show(Bondish()))
```

## Generic functions

```python run TypeVar
from typing import TypeVar, Sequence

T = TypeVar("T")

def first(items: Sequence[T]) -> T:
    return items[0]

print(first([3, 4]), first("xyz"))
```

## Reading hints at run time

```python run get_type_hints
from typing import get_type_hints

def f(a: int, b: list[str] = None) -> bool: ...
print(get_type_hints(f))
```

## In short

- Use `frozen=True` for values that should not change, `slots=True` to save memory, `__post_init__` for validation and `field(default_factory=...)` for mutable defaults.
- Use `replace()` to make modified copies of frozen objects.
- Use `Literal`, `TypedDict`, `Protocol` and generics to describe data and behaviour precisely; run mypy to enforce them.
