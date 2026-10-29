Suppose you are writing an analytics library for analysts who are not engineers. They will not read your source code, so the **API itself** has to guide them. These principles come up again and again.

## 1. Make misuse hard

- Use **immutable** inputs and results (frozen dataclasses, tuples) so values cannot change under the user's feet.
- Use **keyword-only** arguments for options, so calls read clearly.
- Validate at the boundary and fail early.

## 2. Be explicit about units

Most numerical bugs in finance are unit mix-ups: percent versus fraction, basis points, days versus years. Make the unit part of the name or the type.

```python run Explicit units
from dataclasses import dataclass

@dataclass(frozen=True)
class Rate:
    """An interest rate, stored as a fraction (0.05 means 5%)."""
    fraction: float

    @classmethod
    def from_percent(cls, pct):
        return cls(pct / 100)

    @classmethod
    def from_bp(cls, bp):
        return cls(bp / 10_000)

    @property
    def percent(self):
        return self.fraction * 100

    @property
    def bp(self):
        return self.fraction * 10_000

r = Rate.from_bp(25)
print(r, r.percent, r.bp)
```

## 3. Errors that teach

An error should say what was wrong, what was received, and how to fix it.

```python run Helpful messages for bad input
def present_value(cashflow, *, rate, years):
    if not 0 <= rate < 1:
        raise ValueError(
            f"rate must be a fraction between 0 and 1 (got {rate}). "
            f"If you meant {rate}%, pass {rate / 100} or use Rate.from_percent({rate})."
        )
    return cashflow / (1 + rate) ** years

print(round(present_value(100, rate=0.05, years=2), 2))
try:
    present_value(100, rate=5, years=2)
except ValueError as e:
    print("ValueError:", e)
```

## 4. Stable public surface and versioning

- Decide what is public (`__all__`, no leading underscore) and keep everything else private.
- Use **semantic versioning**: a major version for breaking changes, minor for additions, patch for fixes.
- **Deprecate** before removing: keep the old name working, warn, and say what to use instead.

```python run Deprecation warning
import warnings
from functools import wraps

def deprecated(use_instead):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            warnings.warn(
                f"{func.__name__}() is deprecated and will be removed in version 2.0; use {use_instead}() instead.",
                DeprecationWarning,
                stacklevel=2,              # point at the caller's line, not this one
            )
            return func(*args, **kwargs)
        return wrapper
    return decorator

def pv(cashflow, *, rate, years):
    return cashflow / (1 + rate) ** years

@deprecated("pv")
def present_val(cashflow, rate, years):
    return pv(cashflow, rate=rate, years=years)

warnings.simplefilter("always")
print(present_val(100, 0.05, 2))
```

## 5. Immutable, self-describing results

Return objects rather than loose tuples, with a helpful `__repr__`, so users can see what they have.

```python run A result object
from dataclasses import dataclass

@dataclass(frozen=True)
class BondResult:
    price: float
    duration: float
    dv01: float
    currency: str = "USD"

def analyse(face, coupon, years, ytm):
    price = sum(face * coupon / (1 + ytm) ** t for t in range(1, years + 1)) + face / (1 + ytm) ** years
    duration = sum(t * face * coupon / (1 + ytm) ** t for t in range(1, years + 1)) / price + years * face / (1 + ytm) ** years / price
    return BondResult(round(price, 4), round(duration, 4), round(price * duration / (1 + ytm) * 0.0001, 4))

result = analyse(100, 0.05, 5, 0.04)
print(result)
try:
    result.price = 0
except Exception as e:
    print(type(e).__name__)
```

## 6. Everything else

- Document units, shapes and assumptions in docstrings, with a short runnable example.
- Avoid hidden global state and surprising side effects (do not modify inputs in place).
- Keep the common path short with sensible defaults; put rare options behind keyword-only arguments.
- Test the public API, including the error messages.

## In short

- Make the right thing easy and the wrong thing hard: immutability, keyword-only options and explicit units.
- Write errors that explain the fix; deprecate before you remove; version with semantic versioning.
