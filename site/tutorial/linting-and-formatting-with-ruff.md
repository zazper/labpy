**Ruff** is a very fast tool that formats and checks Python code. LabPy includes it behind two buttons:

- **Format** rewrites your code in a consistent style (spacing, quotes, line breaks).
- **Check** lists problems such as unused imports and unused variables. Click a problem to jump to its line.

Ruff downloads the first time you use it.

## Try it

Open this messy example, then press **Format**, and then **Check**.

```python run Messy code to tidy
import os
import sys
def  add( a,b ):
    unused = 5
    return a+b
print( add(1,2) )
```

## What you will see

- Format fixes the spacing, so `a+b` becomes `a + b`, and puts blank lines between definitions.
- Check reports that `os` and `sys` are imported but unused, and that `unused` is assigned but never used.

## Common codes

- `F401` unused import
- `F841` unused local variable
- `E501` line too long
- `F821` undefined name

Use Format before you share code, and Check to catch mistakes early. On your own computer the same tool is `ruff format` and `ruff check`.
