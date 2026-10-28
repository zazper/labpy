Programs on your own computer often use the command line and the environment. A few of these work differently in the browser.

## sys

```python run Python and platform details
import sys
print(sys.version_info >= (3, 10))
print(sys.platform)          # "emscripten" in LabPy, "linux" or "win32" elsewhere
print(sys.argv)              # command-line arguments
```

`sys.argv` is a list of arguments given when a script starts. In LabPy there is no command line, so it holds just the script name. To get values, use `input()` or set variables in the code.

## os

```python run Working directory and environment
import os
print(os.getcwd())
print(os.environ.get("HOME", "no HOME set"))
print(sorted(os.listdir("."))[:3])
```

## Exiting

```python run sys.exit
import sys
print("before")
sys.exit(0)
print("never printed")
```

In the browser there are no real operating-system processes, so features like `subprocess` and network sockets are not available. The cloud runner (coming later) supports them.
