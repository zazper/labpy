`DataFrame.apply(func, axis=1)` calls a Python function once per row. Each call builds a small Series, so it is slow, often 10 to 1000 times slower than a vectorised version.

## Measuring it

```python run apply(axis=1) versus vectorised
import numpy as np, pandas as pd, time

rng = np.random.default_rng(0)
n = 20_000
df = pd.DataFrame({
    "qty": rng.integers(1, 100, n),
    "price": rng.uniform(90, 110, n),
    "cost": rng.uniform(90, 110, n),
})

start = time.perf_counter()
pnl_apply = df.apply(lambda r: r["qty"] * (r["price"] - r["cost"]), axis=1)
t_apply = time.perf_counter() - start

start = time.perf_counter()
pnl_vec = df["qty"] * (df["price"] - df["cost"])
t_vec = time.perf_counter() - start

print(np.allclose(pnl_apply, pnl_vec))
print(f"apply {t_apply:.3f}s | vectorised {t_vec:.5f}s | about {t_apply / max(t_vec, 1e-9):.0f}x faster")
```

## Alternatives, in order of preference

**1. Column arithmetic.** Operate on whole columns, as above.

**2. `np.where` and `np.select` for conditions.**

```python run Conditional logic without apply
import numpy as np, pandas as pd
df = pd.DataFrame({"rating": [1, 5, 10, 14, 20], "spread": [30, 80, 150, 400, 900]})

df["bucket"] = np.select(
    [df["spread"] < 100, df["spread"] < 300],
    ["tight", "medium"],
    default="wide",
)
df["haircut"] = np.where(df["rating"] > 12, 0.10, 0.02)
print(df)
```

**3. Built-in column methods** such as `Series.map` (for a dictionary), `pd.cut`, `.str` and `.dt`.

```python run map, cut and string methods
import pandas as pd
df = pd.DataFrame({"sector": ["gov", "corp", "gov"], "ticker": [" a ", "b", "c "], "dur": [1.2, 6.5, 12.0]})
df["sector_code"] = df["sector"].map({"gov": 1, "corp": 2})
df["ticker"] = df["ticker"].str.strip().str.upper()
df["dur_band"] = pd.cut(df["dur"], [0, 3, 8, 50], labels=["short", "mid", "long"])
print(df)
```

**4. A real loop only if you must.** `itertuples()` is much faster than `iterrows()` or row-wise `apply`.

```python run itertuples
import pandas as pd
df = pd.DataFrame({"a": [1, 2, 3], "b": [10, 20, 30]})
total = 0
for row in df.itertuples(index=False):
    total += row.a * row.b
print(total)
```

**5. Compiled code** (Numba, Cython) for genuinely custom logic that cannot be expressed with array operations, or `df.eval()`/`df.query()` for large expressions.

## Why row-wise apply is slow

- Python function call overhead for every row.
- Each row is converted into a new Series (with a dtype and an index), which is expensive and may change dtypes.
- No use of NumPy's fast loops or CPU vector instructions.

## When apply is fine

- On a **column** (`df["x"].apply(f)`) for a small amount of data, or when the function is complex and speed does not matter.
- Always try the vectorised form first.

## In short

- `apply(axis=1)` runs Python code per row. Use column arithmetic, `np.where`/`np.select`, `map`, `cut` and `.str`/`.dt` instead.
- If you must loop, use `itertuples`, never `iterrows` or row-wise `apply`.
