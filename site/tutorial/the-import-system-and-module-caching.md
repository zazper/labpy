When you `import` a module, Python finds it, runs its code **once**, and stores the module object in the dictionary `sys.modules`. Later imports reuse that cached object.

```python run The module cache
import sys
import math
print("math" in sys.modules)
import math as m2
print(m2 is math)              # the same object: no second import
print(list(sys.modules)[:3])
```

## Import runs the module only once

This example creates a module file, imports it twice and reloads it.

```python run Side effects run once
import importlib, sys

with open("demo_mod.py", "w") as f:
    f.write("print('demo_mod is being executed')\nVALUE = 1\n")
importlib.invalidate_caches()          # needed after creating a file at run time

import demo_mod                        # executes the module code
import demo_mod                        # cached: nothing printed
print(demo_mod.VALUE)

with open("demo_mod.py", "w") as f:
    f.write("print('demo_mod is being executed')\nVALUE = 2\n")
importlib.reload(demo_mod)             # runs the file again
print(demo_mod.VALUE)

del sys.modules["demo_mod"]            # forget it entirely
import demo_mod                        # imported afresh
```

## Where Python looks

```python run Finding a module
import importlib.util, sys
spec = importlib.util.find_spec("json")
print(spec.name, spec.origin is not None)
print(isinstance(sys.path, list))      # directories searched, in order
```

The search order is: modules already in `sys.modules`, built-in modules, then each entry of `sys.path` (the script folder, installed packages and so on).

## Compiled files

CPython saves compiled bytecode in `__pycache__/*.pyc` to speed up the next start. It checks the source file's timestamp, and recompiles if the source changed.

## Pitfalls

- **Import side effects.** Avoid slow or surprising code at module level (connections, large reads). Put it in functions.
- **Circular imports.** If `a` imports `b` and `b` imports `a`, one sees a half-built module. Fix by moving shared code to a third module, or importing inside a function.
- **Shadowing.** A local file named like a standard module (`random.py`, `json.py`) hides the real one.
- **Reload limits.** `reload()` re-runs the module but names already imported with `from x import y` keep the old object.
- **Lazy imports.** Importing inside a function delays cost until needed, useful for heavy optional libraries.

```python run Lazy import
def to_parquet(df, path):
    import pyarrow           # heavy; only loaded when this function is called
    ...

print("module defined; pyarrow not imported yet:", "pyarrow" not in __import__("sys").modules)
```

## In short

- `sys.modules` caches imported modules, so module code runs once per process.
- `importlib.reload` re-executes a module; deleting its entry from `sys.modules` forces a fresh import.
- Keep import-time work light, and avoid circular imports and filenames that shadow the standard library.
