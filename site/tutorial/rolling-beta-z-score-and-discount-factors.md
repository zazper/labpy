Rolling statistics and curve lookups are often written with loops over dates or positions. Each of these has a vectorised form.

## Rolling beta

The **beta** of an asset against a market is `cov(asset, market) / var(market)`. Over a rolling window both can be computed with rolling operations.

```python run Rolling beta
import numpy as np, pandas as pd
rng = np.random.default_rng(42)
n = 500
idx = pd.bdate_range("2024-01-01", periods=n)
market = pd.Series(rng.normal(0, 0.01, n), index=idx, name="mkt")
asset = 0.8 * market + pd.Series(rng.normal(0, 0.005, n), index=idx)

window = 60
beta = asset.rolling(window).cov(market) / market.rolling(window).var()
print(beta.dropna().tail(3).round(3))

# check the last value against a direct calculation
a, m = asset.iloc[-window:], market.iloc[-window:]
print(np.isclose(beta.iloc[-1], np.cov(a, m)[0, 1] / np.var(m, ddof=1)))
```

## Rolling beta for many assets at once

```python run Beta of every column
import numpy as np, pandas as pd
rng = np.random.default_rng(1)
n = 300
idx = pd.bdate_range("2024-01-01", periods=n)
market = pd.Series(rng.normal(0, 0.01, n), index=idx)
assets = pd.DataFrame({f"A{i}": b * market + rng.normal(0, 0.005, n) for i, b in enumerate([0.5, 1.0, 1.5])}, index=idx)

cov = assets.rolling(60).cov(market)                     # each column against the market
beta = cov.div(market.rolling(60).var(), axis=0)
print(beta.dropna().tail(2).round(2))
```

## Rolling z-score

```python run Rolling z-score
import numpy as np, pandas as pd
rng = np.random.default_rng(3)
s = pd.Series(rng.normal(size=300).cumsum(), index=pd.bdate_range("2024-01-01", periods=300))

w = 30
z = (s - s.rolling(w).mean()) / s.rolling(w).std()
signal = pd.Series(np.select([z > 2, z < -2], [-1, 1], default=0), index=s.index)   # a mean-reversion flag
print(z.dropna().tail(3).round(2).tolist())
print(signal.value_counts().to_dict())
```

## Discount factors across a portfolio

Suppose you have a zero-rate curve and many cash flows. Find each cash flow's rate by interpolation, turn it into a discount factor, multiply, and sum per bond. There is no loop.

```python run Vectorised present value
import numpy as np, pandas as pd

curve_t = np.array([0.25, 0.5, 1, 2, 3, 5, 10])                       # years
curve_z = np.array([0.040, 0.041, 0.042, 0.043, 0.044, 0.045, 0.047])   # zero rates

cashflows = pd.DataFrame({
    "bond": ["X"] * 3 + ["Y"] * 5,
    "t":    [1, 2, 3,   0.5, 1, 1.5, 2, 2.5],
    "amount": [5, 5, 105,   2, 2, 2, 2, 102.0],
})

rate = np.interp(cashflows["t"], curve_t, curve_z)         # linear interpolation on the curve
cashflows["df"] = np.exp(-rate * cashflows["t"])           # continuously compounded discount factor
cashflows["pv"] = cashflows["amount"] * cashflows["df"]

print(cashflows.groupby("bond")["pv"].sum().round(4))

# check bond X against a plain loop
loop = sum(a * np.exp(-np.interp(t, curve_t, curve_z) * t) for t, a in zip([1, 2, 3], [5, 5, 105]))
print(np.isclose(loop, cashflows.loc[cashflows["bond"] == "X", "pv"].sum()))
```

`np.interp` holds the end rates flat outside the curve. Interpolating zero rates linearly is one convention; others interpolate log discount factors, so state which you use.

## A fixed schedule for every bond: one matrix product

When all bonds pay on the same dates, put the cash flows in a matrix and multiply by the discount-factor vector.

```python run Matrix form
import numpy as np
times = np.array([1, 2, 3, 4, 5.0])
curve_t = np.array([1, 5.0]); curve_z = np.array([0.04, 0.05])
df = np.exp(-np.interp(times, curve_t, curve_z) * times)          # (5,)

cash = np.array([
    [5, 5, 5, 5, 105],       # bond 1
    [0, 0, 0, 0, 100],       # bond 2 (zero coupon)
    [3, 3, 3, 3, 103],       # bond 3
], dtype=float)              # shape (3 bonds, 5 dates)

print((cash @ df).round(3))   # PV of all bonds in one operation
```

## Habits for vectorised finance code

- Check against a simple loop on a small case (as above).
- Align on dates and keys explicitly; watch for index misalignment when combining Series.
- Document conventions: compounding, day count, interpolation and the window definition.

## In short

- Rolling beta is `rolling.cov / rolling.var`, and a z-score is `(x - rolling mean) / rolling std`.
- Discount factors for a whole portfolio: `np.interp` for rates, vectorised maths for factors, then `groupby.sum()` (or a matrix product for a shared schedule).
