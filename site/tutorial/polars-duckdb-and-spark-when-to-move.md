pandas is excellent up to a point. Past it, three other tools are worth knowing, and the right choice depends on **how big the data is and where it lives**.

## Signs pandas is not enough

- The data does not fit comfortably in memory (as a rough guide, pandas may need 5 to 10 times a file's size in RAM for some operations).
- Group-bys, joins or sorts on tens or hundreds of millions of rows are too slow, because most pandas work uses **one core**.
- You repeatedly read the same large files just to use a few columns.

## The same job in different tools

First the baseline in pandas, which runs here:

```python run Weighted exposure by sector in pandas
import pandas as pd
trades = pd.DataFrame({
    "sector": ["Tech", "Tech", "Energy", "Energy", "Tech"],
    "qty": [10, -5, 20, 15, 8],
    "mv": [100.0, 50.0, 200.0, 150.0, 80.0],
})
out = (
    trades[trades["qty"] > 0]
    .groupby("sector", as_index=False)
    .agg(total_mv=("mv", "sum"), n=("qty", "size"))
)
print(out)
```

The equivalents below read Parquet files and are not available in the browser yet. Run them on your computer or the cloud runner.

```python static Polars (lazy, multi-threaded)
import polars as pl

result = (
    pl.scan_parquet("trades/*.parquet")        # lazy: nothing is read yet
    .filter(pl.col("qty") > 0)
    .group_by("sector")
    .agg(total_mv=pl.col("mv").sum(), n=pl.len())
    .collect()                                  # the optimised plan runs here
)
```

```python static DuckDB (SQL on files, in process)
import duckdb

result = duckdb.sql("""
    SELECT sector, SUM(mv) AS total_mv, COUNT(*) AS n
    FROM 'trades/*.parquet'
    WHERE qty > 0
    GROUP BY sector
""").df()
```

```python static Spark (a cluster)
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.getOrCreate()
result = (
    spark.read.parquet("trades/")
    .filter(F.col("qty") > 0)
    .groupBy("sector")
    .agg(F.sum("mv").alias("total_mv"), F.count("*").alias("n"))
)
```

## When to choose which

- **Stay with pandas** for data that fits easily in memory, exploration, plotting and the small final results. It has the biggest ecosystem.
- **Polars**: faster, multi-threaded and memory-efficient on one machine, with a lazy query planner and the ability to stream data larger than memory. A good next step when pandas gets slow.
- **DuckDB**: run SQL directly on Parquet or CSV files, fast joins and window functions, spills to disk for larger-than-memory work. Ideal for analysts who think in SQL and for ad-hoc queries over many files.
- **Spark** (or Dask): when the data or the processing is too large for **one** machine, or you must run inside a cluster platform. Distributed systems add cost, latency for small jobs and operational complexity, so move to them last.

## Moving between them

They share the Arrow columnar memory format, so converting is cheap:

```python static Interchange
pdf = polars_df.to_pandas()                 # Polars to pandas
polars_df = pl.from_pandas(pdf)             # pandas to Polars
pdf = duckdb.sql("SELECT * FROM 'x.parquet'").df()
```

A common pattern is: **query and reduce with DuckDB or Polars, then hand the small result to pandas** for the last mile.

## A quick decision guide

- Fits in memory and is fast enough: pandas.
- Fits on one machine but is slow or tight on memory: Polars or DuckDB, with Parquet.
- Needs many machines, or the company already runs a cluster: Spark.

Whatever the tool, the earlier advice applies: store data as partitioned Parquet, read only the columns you need, and filter early.

## In short

- pandas hits limits with big, multi-core or larger-than-memory work. Polars and DuckDB extend one machine; Spark spreads across many.
- Reduce the data first, then use pandas for the final small result.
