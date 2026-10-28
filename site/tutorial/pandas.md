**pandas** is the main tool for tables of data. A **DataFrame** is a table with labelled columns. It loads automatically on import.

```python run Creating a DataFrame
import pandas as pd
df = pd.DataFrame({
    "name": ["Ada", "Bob", "Cy", "Di"],
    "dept": ["Eng", "Ops", "Eng", "Ops"],
    "salary": [120, 80, 110, 95],
})
print(df)
print(df.shape)
print(df["salary"].mean())
```

## Selecting and filtering

```python run Columns and conditions
import pandas as pd
df = pd.DataFrame({"name": ["Ada", "Bob", "Cy"], "age": [36, 25, 30]})
print(df[df["age"] > 26])
print(df[["name"]])
df["age_next_year"] = df["age"] + 1
print(df)
```

## Grouping

```python run groupby
import pandas as pd
df = pd.DataFrame({"dept": ["Eng", "Ops", "Eng", "Ops"], "salary": [120, 80, 110, 95]})
print(df.groupby("dept")["salary"].agg(["mean", "max"]))
```

## Reading CSV text

```python run read_csv
import pandas as pd, io
csv_text = "city,pop\nOslo,700000\nBergen,285000\n"
df = pd.read_csv(io.StringIO(csv_text))
print(df.sort_values("pop", ascending=False))
print(df.describe())
```

To read a file you uploaded, use `pd.read_csv("yourfile.csv")`.
