pandas treats a **DatetimeIndex** as special: it can resample, roll, convert time zones and understand business days.

## Resample: change the frequency

```python run Resample to weekly
import numpy as np, pandas as pd
idx = pd.bdate_range("2026-01-05", periods=15)
px = pd.Series(100 + np.arange(15) * 0.5, index=idx, name="px")

print(px.resample("W").last())               # last price of each week
print(px.resample("W").agg(["first", "max", "min", "last"]))
print(px.resample("W").mean().round(2))
```

Choose the aggregation to match the meaning: `last` for prices, `sum` for volume and `mean` for rates.

## Rolling windows

```python run Rolling and expanding windows
import numpy as np, pandas as pd
rng = np.random.default_rng(0)
s = pd.Series(rng.normal(size=8).round(2), index=pd.bdate_range("2026-01-05", periods=8))

print(s.rolling(3).mean().round(2).tolist())               # first 2 values are NaN
print(s.rolling(3, min_periods=1).mean().round(2).tolist())
print(s.rolling("3D").sum().round(2).tolist())             # window by time, not by count
print(s.ewm(span=3).mean().round(2).tolist())              # exponentially weighted
print(s.pct_change().round(3).tolist()[:4], s.diff().round(2).tolist()[:3])
```

A count-based window (`rolling(3)`) means three **rows**; a time-based window (`rolling("3D")`) means three **days**, which matters when the data has gaps.

## Time zones

Store timestamps in **UTC**, and convert for display. A naive timestamp has no zone; attach one with `tz_localize`, then convert with `tz_convert`.

```python run Localize and convert
import pandas as pd
t = pd.date_range("2026-03-02 14:30", periods=3, freq="h")     # naive times
utc = t.tz_localize("UTC")
ny = utc.tz_convert("America/New_York")
print(utc[0], "->", ny[0])
print(ny.tz, ny.hour.tolist())
```

Local times around a clock change are tricky: some do not exist (clocks jump forward) and some happen twice (clocks go back).

```python run Daylight-saving ambiguity
import pandas as pd
ambiguous = pd.DatetimeIndex(["2026-11-01 01:30"])         # happens twice in New York
print(ambiguous.tz_localize("America/New_York", ambiguous=[True]))     # first occurrence (daylight time)
print(ambiguous.tz_localize("America/New_York", ambiguous=[False]))    # second occurrence (standard time)
```

Without a choice, pandas raises an error rather than guess. Use UTC to avoid the problem.

## Business-day calendars

```python run Business days and custom holidays
import pandas as pd
from pandas.tseries.offsets import BDay, CustomBusinessDay

print(pd.bdate_range("2026-12-21", periods=6).strftime("%a %d").tolist())     # skips weekends
print((pd.Timestamp("2026-03-05") + BDay(3)).strftime("%a %Y-%m-%d"))         # 3 business days later

holidays = ["2026-12-25", "2026-01-01"]
cbd = CustomBusinessDay(holidays=holidays)
print(pd.date_range("2026-12-23", periods=4, freq=cbd).strftime("%a %d").tolist())   # skips Dec 25
print((pd.Timestamp("2026-12-24") + cbd).strftime("%a %Y-%m-%d"))
```

For real market calendars use a dedicated package (such as `pandas_market_calendars` or `exchange_calendars`), because exchange holidays differ from public holidays.

## Reindexing to a calendar

```python run asfreq and reindex
import pandas as pd
s = pd.Series([1.0, 2.0, 4.0], index=pd.to_datetime(["2026-03-02", "2026-03-03", "2026-03-06"]))
print(s.asfreq("B"))                    # insert the missing business days as NaN
print(s.asfreq("B").ffill().tolist())
```

## In short

- `resample` changes frequency, `rolling`/`ewm` compute windows (by rows or by time), and `shift`/`diff`/`pct_change` compare periods.
- Keep timestamps in UTC; use `tz_localize` once and `tz_convert` to display; handle daylight-saving ambiguity explicitly.
- Use business-day offsets and a real exchange calendar, not just weekdays.
