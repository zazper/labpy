Missing and stale prices are normal in market data. Filling them carelessly hides problems, so the rule is: **fill if you must, but always flag what you did**.

## Find the gaps

```python run Count and locate missing values
import numpy as np, pandas as pd
idx = pd.bdate_range("2026-01-05", periods=10)
px = pd.Series([100, 101, np.nan, np.nan, np.nan, 103, 103, 103, 103, 104.0], index=idx, name="px")
print(px.isna().sum(), "missing of", len(px))
print(px[px.isna()].index.strftime("%a %d %b").tolist())
```

## Forward fill with a limit and a flag

A forward fill carries the last price forward. Limit how far it goes, and record which values were filled.

```python run Fill with a limit, flag what was filled
import numpy as np, pandas as pd
idx = pd.bdate_range("2026-01-05", periods=10)
px = pd.Series([100, 101, np.nan, np.nan, np.nan, 103, 103, 103, 103, 104.0], index=idx, name="px")

out = pd.DataFrame({"raw": px})
out["filled"] = px.ffill(limit=2)                      # carry at most 2 days
out["is_filled"] = px.isna() & out["filled"].notna()
out["still_missing"] = out["filled"].isna()
print(out)
```

The third missing day is still `NaN`: the data is too old to trust. Decide explicitly what downstream code should do with it.

## Detect stale prices

A price that never changes may be a feed problem, not a quiet market. Measure how long a value has been unchanged.

```python run Stale-price run lengths
import numpy as np, pandas as pd
idx = pd.bdate_range("2026-01-05", periods=10)
px = pd.Series([100, 101, np.nan, np.nan, np.nan, 103, 103, 103, 103, 104.0], index=idx)

run_id = (px != px.shift()).cumsum()               # a new id whenever the value changes
run_length = px.groupby(run_id).cumcount() + 1      # 1, 2, 3, ... within each run
stale = px.notna() & (run_length >= 3)              # same value on 3+ observations in a row
print(pd.DataFrame({"px": px, "run_length": run_length, "stale": stale}))
```

## Missing dates versus missing values

A weekend is not missing data, but a missing weekday is. Compare against a business-day calendar.

```python run Find missing business days
import pandas as pd
dates = pd.to_datetime(["2026-01-05", "2026-01-06", "2026-01-08", "2026-01-09"])
s = pd.Series([1.0, 2.0, 4.0, 5.0], index=dates)
full = pd.bdate_range(s.index.min(), s.index.max())
print("missing dates:", full.difference(s.index).strftime("%Y-%m-%d").tolist())
print(s.reindex(full))
```

## Other choices

- **Drop** rows with missing prices when you cannot trust a fill (`dropna`).
- **Interpolate** (`interpolate()`) suits smooth quantities like curves, rarely prices of traded assets, because it uses **future** values and so introduces look-ahead.
- **Fill with a default** only where a default is truly meaningful (a zero position).
- Keep the **raw** column. Never overwrite the original.
- Do not forward-fill across **corporate actions, halts or delistings** without checking.

```python run Interpolation uses future data
import numpy as np, pandas as pd
s = pd.Series([100.0, np.nan, np.nan, 106.0])
print(s.ffill().tolist())            # uses only the past
print(s.interpolate().tolist())      # uses the later 106 to fill earlier days
```

## In short

- Flag first, then fill (with a limit). Detect stale data separately, and keep the raw values.
- Distinguish missing dates from missing values using a business-day calendar.
- Forward fill uses only the past; interpolation looks ahead, which can bias back-tests.
