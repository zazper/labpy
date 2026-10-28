A **module** is a Python file you can reuse. Use `import` to bring its code into your program.

```python run Importing a module
import math
print(math.sqrt(49))
print(math.pi)
```

## Ways to import

```python run import styles
from math import sqrt, floor      # pick names
import random as rnd              # short alias
from datetime import date

print(sqrt(81), floor(2.9))
print(date(2026, 1, 15).year)
```

Avoid `from module import *`, which makes it unclear where names come from.

## Your own modules

Any `.py` file in your LabPy workspace is a module. Create `utils.py` with the **+** tab:

```python static utils.py
def greet(name):
    return f"Hello, {name}!"
```

Then import it from `main.py`:

```python static main.py
import utils
print(utils.greet("Ada"))
```

Use the **Multiple files** example in the Examples menu to try it.
