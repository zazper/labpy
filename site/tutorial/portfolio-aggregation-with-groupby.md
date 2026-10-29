A common job is rolling many positions up to portfolio and sector level: total market value, **DV01**, weighted-average duration and how much each sector contributes.

**DV01** is the change in a position's value for a one basis point (0.01 percent) move in yield. For a position with market value `MV` and modified duration `D`, `DV01 ≈ MV × D × 0.0001`.

```python run Portfolio data and DV01
import pandas as pd

positions = pd.DataFrame({
    "bond": ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
    "sector": ["Govt", "Govt", "Corp", "Corp", "Corp", "Muni", "Muni", "Corp"],
    "market_value": [50.0, 30.0, 20.0, 15.0, 25.0, 10.0, 12.0, 8.0],   # millions
    "mod_duration": [2.1, 7.5, 4.0, 6.2, 8.8, 5.5, 3.3, 9.1],
})
positions["dv01"] = positions["market_value"] * positions["mod_duration"] * 0.0001 * 1_000_000
print(positions)
```

## Portfolio totals

The weighted-average duration is `Σ(MV × D) / Σ(MV)`.

```python run Portfolio level numbers
import pandas as pd
positions = pd.DataFrame({
    "sector": ["Govt", "Govt", "Corp", "Corp", "Corp", "Muni", "Muni", "Corp"],
    "market_value": [50.0, 30.0, 20.0, 15.0, 25.0, 10.0, 12.0, 8.0],
    "mod_duration": [2.1, 7.5, 4.0, 6.2, 8.8, 5.5, 3.3, 9.1],
})
positions["dv01"] = positions["market_value"] * positions["mod_duration"] * 100      # per million, in dollars

total_mv = positions["market_value"].sum()
port_duration = (positions["market_value"] * positions["mod_duration"]).sum() / total_mv
print(f"market value {total_mv:.1f}m | duration {port_duration:.3f} | DV01 {positions['dv01'].sum():,.0f}")
```

## By sector with groupby

The fast way is to create the helper column **first** and then use ordinary aggregations, rather than `groupby().apply()` with a Python function.

```python run Sector aggregation and contributions
import pandas as pd

positions = pd.DataFrame({
    "sector": ["Govt", "Govt", "Corp", "Corp", "Corp", "Muni", "Muni", "Corp"],
    "market_value": [50.0, 30.0, 20.0, 15.0, 25.0, 10.0, 12.0, 8.0],
    "mod_duration": [2.1, 7.5, 4.0, 6.2, 8.8, 5.5, 3.3, 9.1],
})
positions["dv01"] = positions["market_value"] * positions["mod_duration"] * 100
positions["mv_x_dur"] = positions["market_value"] * positions["mod_duration"]   # helper column

by_sector = positions.groupby("sector").agg(
    market_value=("market_value", "sum"),
    dv01=("dv01", "sum"),
    mv_x_dur=("mv_x_dur", "sum"),
)
total_mv = positions["market_value"].sum()

by_sector["duration"] = by_sector["mv_x_dur"] / by_sector["market_value"]          # sector's own duration
by_sector["weight"] = by_sector["market_value"] / total_mv
by_sector["duration_contribution"] = by_sector["mv_x_dur"] / total_mv                # = weight x duration
by_sector["dv01_share"] = by_sector["dv01"] / by_sector["dv01"].sum()

print(by_sector.round(3))

port_duration = positions["mv_x_dur"].sum() / total_mv
assert abs(by_sector["duration_contribution"].sum() - port_duration) < 1e-9
print("contributions add up to the portfolio duration:", round(port_duration, 3))
```

Contributions add up to the portfolio total because `Σ weight × duration = duration`. Checking with `assert` is a good habit.

## Weights within a group

`transform` returns a result the same size as the original, which is handy for within-group weights.

```python run transform for within-sector weights
import pandas as pd
df = pd.DataFrame({"sector": ["A", "A", "B"], "mv": [30.0, 10.0, 5.0]})
df["weight_in_sector"] = df["mv"] / df.groupby("sector")["mv"].transform("sum")
print(df)
```

## Multiple levels and averages

```python run Two grouping keys and a weighted average
import numpy as np, pandas as pd
df = pd.DataFrame({
    "sector": ["Corp", "Corp", "Govt", "Govt"],
    "rating": ["BBB", "A", "AAA", "AAA"],
    "mv": [10.0, 20.0, 30.0, 40.0],
    "oas": [150.0, 90.0, 10.0, 12.0],
})
df["mv_x_oas"] = df["mv"] * df["oas"]
g = df.groupby(["sector", "rating"], as_index=False)[["mv", "mv_x_oas"]].sum()
g["oas"] = g["mv_x_oas"] / g["mv"]
print(g[["sector", "rating", "mv", "oas"]])
```

## In short

- Add helper columns (such as `mv × duration`), then use `groupby().agg(...)`: it is fast and clear.
- Weighted average = `sum(weight × value) / sum(weight)`, and sector contributions are `weight × sector value`; they sum to the portfolio figure, so assert it.
- Avoid `groupby().apply()` with a Python function for large data.
