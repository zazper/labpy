The `datetime` module handles dates, times and differences between them.

```python run Dates and times
from datetime import date, datetime, timedelta

d = date(2026, 3, 14)
print(d, d.year, d.month, d.day, d.strftime("%A"))

t = datetime(2026, 3, 14, 9, 30)
print(t, t.hour)
```

## Date arithmetic

```python run timedelta
from datetime import date, timedelta
start = date(2026, 1, 31)
print(start + timedelta(days=30))
print(date(2026, 12, 25) - date(2026, 1, 1))
```

## Formatting and parsing

```python run strftime and strptime
from datetime import datetime
now = datetime(2026, 7, 4, 15, 5)
print(now.strftime("%d %B %Y, %H:%M"))
print(now.isoformat())

parsed = datetime.strptime("2026-07-04 15:05", "%Y-%m-%d %H:%M")
print(parsed == now)
print(datetime.fromisoformat("2026-07-04T15:05:00"))
```

## The current time

```python run Now in UTC
from datetime import datetime, timezone
print(datetime.now(timezone.utc).year >= 2026)
```

Common format codes: `%Y` year, `%m` month number, `%d` day, `%H` hour, `%M` minute, `%S` second, `%A` weekday name, `%B` month name.
