A **package** is a folder of modules. It contains a file named `__init__.py` (which can be empty) that marks it as a package.

```text static Layout
shapes/
    __init__.py
    circle.py
    square.py
main.py
```

Import from it with dots:

```python static main.py
from shapes import circle
from shapes.square import area
```

## Building a package right now

This example writes a small package to the workspace and imports it. Look for the new files under **Download > Output files**.

```python run Create and import a package
import os
os.makedirs("mypkg", exist_ok=True)
open("mypkg/__init__.py", "w").write("")
open("mypkg/tools.py", "w").write("def hi():\n    return 'hi from a package'\n")

from mypkg import tools
print(tools.hi())
```

In LabPy you can also name a file with a folder, such as `shapes/circle.py`, using the **+** tab.
