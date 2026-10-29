How do you handle 100 million rows? First count the memory, then shrink the data, then process it in pieces, and finally store it in a better format.

## Do the arithmetic

A float64 column of 100 million rows is 800 MB. Ten of them are 8 GB, and pandas often needs temporary copies during operations, so you can need several times the file size in memory. Text columns are costlier still.

## Shrink it: dtypes and categoricals

```python run Memory before and after
import numpy as np, pandas as pd
rng = np.random.default_rng(0)
n = 200_000
symbols = np.array([f"SYM{i:03d}" for i in range(50)])
df = pd.DataFrame({
    "symbol": rng.choice(symbols, n),
    "qty": rng.integers(0, 1000, n),
    "price": rng.uniform(10, 500, n),
    "side": rng.choice(["buy", "sell"], n),
})
before = df.memory_usage(deep=True).sum() / 1e6

small = df.astype({"symbol": "category", "side": "category", "qty": "int16", "price": "float32"})
after = small.memory_usage(deep=True).sum() / 1e6

print(f"before {before:.1f} MB | after {after:.1f} MB")
print(small.dtypes.astype(str).to_dict())
print(np.allclose(df["price"], small["price"], rtol=1e-6))
```

- **Categorical**: a text column with few distinct values stores small integer codes plus one list of labels.
- **Smaller numeric dtypes** (`int16`, `float32`) when the range and precision allow (check with `df.describe()` and the NumPy dtype topic).
- `pd.to_numeric(col, downcast="integer")` can choose an integer size for you.
- Load only what you need with `usecols`.

## Chunking: process in pieces

Read part of a file at a time, reduce each part, and combine the small results.

```python run Aggregate a CSV in chunks
import numpy as np, pandas as pd
rng = np.random.default_rng(1)
n = 200_000
pd.DataFrame({
    "sector": rng.choice(["Govt", "Corp", "Muni"], n),
    "mv": rng.uniform(1, 100, n),
}).to_csv("positions.csv", index=False)

parts = []
for chunk in pd.read_csv("positions.csv", usecols=["sector", "mv"], dtype={"sector": "category"}, chunksize=50_000):
    parts.append(chunk.groupby("sector", observed=True)["mv"].agg(["sum", "count"]))

total = pd.concat(parts).groupby(level=0).sum()          # combine the partial results
print(total.round(1))

full = pd.read_csv("positions.csv").groupby("sector")["mv"].sum()
print(np.allclose(total["sum"].sort_index(), full.sort_index()))
```

Chunking works when the answer can be **combined from partial results**: sums, counts, min, max. A mean is a sum and a count; medians and exact quantiles are harder.

## Use a better file format: Parquet

CSV is text: large, slow and untyped. **Parquet** is columnar and compressed, stores types, and lets you read only the columns and rows you need.

```python static Writing and reading Parquet
import pandas as pd

df.to_parquet("positions.parquet", index=False, compression="zstd")      # needs pyarrow

# read just two columns, and only some rows
subset = pd.read_parquet(
    "positions.parquet",
    columns=["sector", "mv"],
    filters=[("sector", "==", "Corp")],
)
```

Partition large datasets into folders by date or symbol so queries can skip most files.

## Other habits

- Develop on a **sample** (`nrows=` or `df.sample`), then run on the full data.
- Avoid copies: assign back, do not keep many intermediate DataFrames, and delete what you no longer need.
- Prefer vectorised operations and `groupby` over Python loops.
- Check `df.info(memory_usage="deep")` early.
- When one machine is not enough, see the next topic.

## In short

- Estimate memory first; shrink with categoricals and smaller dtypes, load only needed columns, and chunk when results can be combined.
- Store data as Parquet, partitioned sensibly, and read only what you need.
