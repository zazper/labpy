`merge`, `join` and `concat` combine tables in different ways. The most dangerous mistake is **row explosion**: a join on a key that is not unique multiplies rows without any error.

## merge (SQL-style join on columns)

```python run A one-to-many merge
import pandas as pd
trades = pd.DataFrame({"trade_id": [1, 2, 3], "ticker": ["A", "B", "A"], "qty": [10, 20, 30]})
ref = pd.DataFrame({"ticker": ["A", "B"], "sector": ["Tech", "Energy"]})
out = trades.merge(ref, on="ticker", how="left")
print(out)
print(len(trades), "->", len(out))        # unchanged: ref has unique tickers
```

## Row explosion

If the right-hand table has a **duplicate key**, every matching left row is repeated.

```python run Duplicate keys multiply rows
import pandas as pd
trades = pd.DataFrame({"trade_id": [1, 2, 3], "ticker": ["A", "B", "A"]})
ref = pd.DataFrame({"ticker": ["A", "A", "B"], "sector": ["Tech", "Tech (old)", "Energy"]})   # two rows for A
out = trades.merge(ref, on="ticker", how="left")
print(out)
print(len(trades), "->", len(out))        # 3 -> 5: trades 1 and 3 were duplicated
```

## How to detect it

```python run Check keys and sizes
import pandas as pd
trades = pd.DataFrame({"trade_id": [1, 2, 3], "ticker": ["A", "B", "A"]})
ref = pd.DataFrame({"ticker": ["A", "A", "B"], "sector": ["Tech", "Tech (old)", "Energy"]})

print("duplicate keys in ref:", ref["ticker"].duplicated().any())
print(ref[ref["ticker"].duplicated(keep=False)])

# expected size of an inner join: sum over keys of (left count x right count)
lc, rc = trades["ticker"].value_counts(), ref["ticker"].value_counts()
print("expected rows:", int((lc * rc).dropna().sum()))
```

Better still, tell pandas what you expect, and it raises an error if the data disagrees.

```python run validate raises a MergeError
import pandas as pd
trades = pd.DataFrame({"trade_id": [1, 2], "ticker": ["A", "B"]})
ref = pd.DataFrame({"ticker": ["A", "A", "B"], "sector": ["x", "y", "z"]})
trades.merge(ref, on="ticker", how="left", validate="many_to_one")
```

`validate` accepts `"one_to_one"`, `"one_to_many"`, `"many_to_one"` and `"many_to_many"`.

## Finding unmatched rows

```python run indicator=True
import pandas as pd
left = pd.DataFrame({"id": [1, 2, 3]})
right = pd.DataFrame({"id": [2, 3, 4], "v": ["b", "c", "d"]})
out = left.merge(right, on="id", how="outer", indicator=True)
print(out)
print(out["_merge"].value_counts())
```

## join (merge on the index)

```python run join
import pandas as pd
prices = pd.DataFrame({"px": [10.0, 20.0]}, index=["A", "B"])
sectors = pd.DataFrame({"sector": ["Tech", "Energy"]}, index=["A", "B"])
print(prices.join(sectors))
trades = pd.DataFrame({"ticker": ["A", "B", "A"], "qty": [1, 2, 3]})
print(trades.join(prices, on="ticker"))       # match a column against the other table's index
```

## concat (stack tables)

```python run concat
import pandas as pd
jan = pd.DataFrame({"sym": ["A", "B"], "v": [1, 2]})
feb = pd.DataFrame({"sym": ["A", "C"], "v": [3, 4]})
print(pd.concat([jan, feb], ignore_index=True))
print(pd.concat([jan, feb], keys=["jan", "feb"]))
other = pd.DataFrame({"w": [9, 8]})
print(pd.concat([jan, other], axis=1))           # side by side, aligned on the index
```

`concat` with different columns fills the gaps with `NaN`. Beware of aligning on an index you did not mean to share.

## Quick reference

- **merge**: match on columns (or index) with `how="inner"`, `"left"`, `"right"` or `"outer"`.
- **join**: a shortcut for merging on the index.
- **concat**: stack tables (rows) or place them side by side (columns).

## In short

- Non-unique keys multiply rows. Check `duplicated()`, compare row counts before and after, and pass `validate=` so pandas stops you.
- Use `indicator=True` to see unmatched rows. Prefer `how="left"` and assert the row count is unchanged.
