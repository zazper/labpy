`loc` selects by **label**, `iloc` by **integer position**. Mixing them up is a classic source of wrong results.

```python run Labels versus positions
import pandas as pd
df = pd.DataFrame({"price": [10, 11, 12, 13, 14], "qty": [1, 2, 3, 4, 5]},
                  index=["a", "b", "c", "d", "e"])

print(df.loc["b"].tolist())          # row labelled "b"
print(df.iloc[1].tolist())           # second row, by position
print(df.loc["b":"d"])               # label slices INCLUDE the end
print(df.iloc[1:3])                  # position slices EXCLUDE the end
```

## The integer-index trap

After filtering or sorting, the old integer labels stay. `loc[0]` then means label 0, not the first row.

```python run Labels survive filtering
import pandas as pd
df = pd.DataFrame({"x": [5, 3, 8, 1]})
s = df.sort_values("x")
print(s)
print(s.loc[0].tolist())     # the row that was originally first (label 0)
print(s.iloc[0].tolist())    # the row that is now first
```

## Rows and columns together

```python run Selecting with conditions
import pandas as pd
df = pd.DataFrame({"sym": ["A", "B", "C", "D"], "px": [10.0, 20.0, 30.0, 40.0], "qty": [1, 2, 3, 4]})

print(df.loc[df["px"] > 15, ["sym", "px"]])         # mask + columns
print(df.loc[:, "px":"qty"])                         # label slice of columns
print(df.iloc[:2, [0, 2]])                           # positions: first 2 rows, columns 0 and 2
print(df.loc[lambda d: d["qty"] % 2 == 0])           # a function of the DataFrame
```

## Setting values

Use a single `loc` call so pandas knows exactly what to modify.

```python run Assign with loc
import pandas as pd
df = pd.DataFrame({"px": [10.0, 20.0, 30.0], "flag": [0, 0, 0]})
df.loc[df["px"] > 15, "flag"] = 1
df.loc[0, "px"] = 11.5
print(df)
```

## Single values: at and iat

```python run Fast scalar access
import pandas as pd
df = pd.DataFrame({"px": [10.0, 20.0]}, index=["a", "b"])
print(df.at["b", "px"], df.iat[0, 0])
df.at["a", "px"] = 12.0
print(df)
```

## Series or DataFrame?

```python run Single versus double brackets
import pandas as pd
df = pd.DataFrame({"x": [1, 2], "y": [3, 4]})
print(type(df["x"]).__name__, type(df[["x"]]).__name__)
print(df["x"].shape, df[["x"]].shape)
```

## Habits that prevent bugs

- Use `loc` for labels and conditions, `iloc` only for true positions.
- Do not chain selections when assigning (see the copy-semantics topic).
- When the index matters, set it deliberately (`set_index`), or use `reset_index(drop=True)` after filtering so positions and labels agree.
- Avoid looping with `iloc[i]`; select whole columns or vectorise.

## In short

- `loc` is label-based and inclusive of its end; `iloc` is position-based and exclusive.
- Filtering and sorting keep the old labels, so `loc[0]` and `iloc[0]` can differ.
- Assign with one `loc[rows, columns] = value`.
