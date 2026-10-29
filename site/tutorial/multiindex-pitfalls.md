A **MultiIndex** gives a table more than one index level (for example sector and ticker, or date and symbol). It is powerful, but it brings surprises.

## Creating and reading one

```python run Creating a MultiIndex
import pandas as pd
df = pd.DataFrame({
    "sector": ["Tech", "Tech", "Energy", "Energy"],
    "ticker": ["AAA", "BBB", "CCC", "DDD"],
    "px": [10.0, 20.0, 30.0, 40.0],
}).set_index(["sector", "ticker"])

print(df)
print(df.loc["Tech"])                    # all tickers in Tech
print(df.loc[("Energy", "CCC")].tolist())
print(df.xs("BBB", level="ticker"))      # cross-section on an inner level
```

## Slicing needs a sorted index

Slicing a MultiIndex that is not sorted raises an error (or runs slowly with a warning).

```python run Unsorted index error
import pandas as pd
idx = pd.MultiIndex.from_tuples([("b", 1), ("a", 2), ("b", 2), ("a", 1)], names=["k", "n"])
s = pd.Series([1, 2, 3, 4], index=idx)
print(s.loc["a":"b"])
```

```python run Sort first
import pandas as pd
idx = pd.MultiIndex.from_tuples([("b", 1), ("a", 2), ("b", 2), ("a", 1)], names=["k", "n"])
s = pd.Series([1, 2, 3, 4], index=idx).sort_index()
print(s.loc["a":"b"])
print(s.index.is_monotonic_increasing)
```

Always `sort_index()` after building a MultiIndex you plan to slice.

## Selecting with several levels: IndexSlice

```python run pd.IndexSlice
import pandas as pd
df = pd.DataFrame({"px": range(8)}, index=pd.MultiIndex.from_product([["A", "B"], ["x", "y"], [1, 2]], names=["a", "b", "n"])).sort_index()
idx = pd.IndexSlice
print(df.loc[idx[:, "x", :], :])             # every a, only b == "x"
print(df.loc[idx["A", :, 2], :])
```

## Reshaping: unstack and stack

```python run unstack
import pandas as pd
long = pd.DataFrame({
    "date": ["d1", "d1", "d2", "d2"], "sym": ["A", "B", "A", "B"], "px": [1.0, 2.0, 1.1, 2.2],
}).set_index(["date", "sym"])
wide = long["px"].unstack("sym")
print(wide)
print(wide.stack())
```

## The common pitfalls

- **Unsorted index**: errors or slow lookups; sort first.
- **Level confusion**: `df.loc[x]` selects the first level; use `xs` or `IndexSlice` for others. Selecting one row can drop levels.
- **MultiIndex columns** appear from `agg` with a list. Flatten them, or use named aggregation instead.
- **Alignment surprises**: arithmetic aligns on every level, and silently produces `NaN` where levels differ.
- **Harder merging, plotting and saving**: many tools expect plain columns.

```python run Flatten MultiIndex columns
import pandas as pd
df = pd.DataFrame({"g": ["a", "a", "b"], "v": [1, 2, 3]})
agg = df.groupby("g").agg({"v": ["sum", "mean"]})
print(agg.columns.tolist())
agg.columns = ["_".join(c) for c in agg.columns]
print(agg)

named = df.groupby("g").agg(v_sum=("v", "sum"), v_mean=("v", "mean"))     # simpler: named aggregation
print(named)
```

## When to avoid a MultiIndex

Most of the time, keep keys as **ordinary columns** and use `groupby`, `merge` and `pivot`. Use a MultiIndex when the data truly is panel-shaped (date x symbol) and you use `unstack`, `xs` or time-series operations across it. If you only use it to hold two keys, `reset_index()` and plain columns are simpler and less error-prone.

```python run reset_index
import pandas as pd
df = pd.DataFrame({"sector": ["A", "A", "B"], "px": [1, 2, 3]})
g = df.groupby("sector")["px"].sum()          # a Series with an index
print(g.reset_index())                        # back to ordinary columns
```

## In short

- Sort the index before slicing; use `xs` and `pd.IndexSlice` to select inner levels.
- Flatten columns from `agg`, or use named aggregation.
- Prefer plain columns and `groupby` unless the data is genuinely panel-shaped.
