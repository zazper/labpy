Thousands of extra libraries are on **PyPI**, the Python Package Index. In regular Python you install them with `pip`. In LabPy there are two ways.

## Built-in scientific packages

Libraries such as NumPy, pandas, matplotlib, SciPy and scikit-learn load automatically when you `import` them. The first import downloads them.

```python run Automatic loading
import numpy as np
print(np.arange(5) * 2)
```

## micropip for other pure-Python packages

`micropip` installs pure-Python packages from PyPI. Use `await` directly in LabPy.

```python run Installing with micropip
import micropip
await micropip.install("python-slugify")

from slugify import slugify
print(slugify("Hello from LabPy!"))
```

## Limits

- Only pure-Python packages (and ones built for WebAssembly) work in the browser.
- Packages needing C extensions, sockets or operating-system features may fail.
- For those, the cloud runner (coming later) uses real Python with regular `pip`.

On your own computer the equivalent is `pip install python-slugify`.
