When you select part of a DataFrame, is the result a **copy** or a **view** of the original? Historically pandas did not always say, which led to the `SettingWithCopyWarning` and to bugs where an assignment silently changed nothing.

## The problem: chained assignment

`df[condition]["col"] = value` is two operations: first it builds a subset, then it assigns into that subset, which may be a temporary copy.

```python run Chained assignment does not update the original
import warnings
import pandas as pd

df = pd.DataFrame({"a": [1, 2, 3], "b": [0, 0, 0]})

with warnings.catch_warnings():
    warnings.simplefilter("ignore")      # older pandas warns here; newer pandas may too
    df[df["a"] > 1]["b"] = 99            # modifies a temporary copy
print(df)                                # b is still all zeros
```

## The fix: one loc call

```python run Assign with loc
import pandas as pd
df = pd.DataFrame({"a": [1, 2, 3], "b": [0, 0, 0]})
df.loc[df["a"] > 1, "b"] = 99
print(df)
```

## Working on a subset: make an explicit copy

If you want to modify a subset independently, say so.

```python run Explicit copy of a subset
import warnings
import pandas as pd

df = pd.DataFrame({"a": [1, 2, 3], "b": [0, 0, 0]})

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    risky = df[df["a"] > 1]
    risky["b"] = 5                         # older pandas: SettingWithCopyWarning
safe = df[df["a"] > 1].copy()
safe["b"] = 5                              # no ambiguity
print(df["b"].tolist(), safe["b"].tolist())
```

## Copy-on-Write: the modern rule

Copy-on-Write (CoW) gives pandas one simple behaviour: **any derived object behaves as its own copy**. Changing one never changes another, and the data is only physically copied when needed. It is the default in pandas 3 and can be switched on in pandas 2 with:

```python static Enable Copy-on-Write in pandas 2.x
import pandas as pd
pd.options.mode.copy_on_write = True
```

```python run Derived objects are independent
import pandas as pd
df = pd.DataFrame({"a": [1, 2, 3]})
sub = df[df["a"] > 1]
sub = sub.assign(a=sub["a"] * 10)         # returns a new object; df is untouched
print(df["a"].tolist(), sub["a"].tolist())
```

## Aliases are still aliases

Assignment between names never copies, whatever the pandas version.

```python run df2 = df is not a copy
import pandas as pd
df = pd.DataFrame({"a": [1, 2]})
alias = df
alias["a"] = [9, 9]
print(df["a"].tolist())                    # changed, because alias is df
independent = df.copy()
independent["a"] = 0
print(df["a"].tolist())
```

## Habits

- Never chain `[...][...] = value`. Use `df.loc[rows, col] = value`.
- To modify a subset on its own, call `.copy()` explicitly.
- Prefer methods that return new objects (`assign`, `where`, `replace`) over in-place changes; treat `inplace=True` as no faster and often not helpful.
- Do not silence the warning; fix the pattern.

## In short

- Chained assignment edits a temporary object. Use one `loc` call, or `.copy()` for an independent subset.
- With Copy-on-Write, derived objects always behave as separate copies; an alias (`df2 = df`) is still the same object.
