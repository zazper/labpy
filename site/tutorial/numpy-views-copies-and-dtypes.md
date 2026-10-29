Knowing when NumPy shares memory and when it copies explains many surprises, and many speed and memory differences.

## Views share memory

Slicing gives a **view**: a new array object looking at the same data.

```python run Slices are views
import numpy as np
a = np.arange(10)
b = a[2:5]
b[0] = 99
print(a)                           # a changed too
print(b.base is a, np.shares_memory(a, b))
```

## Fancy and boolean indexing give copies

```python run Index arrays and masks copy
import numpy as np
a = np.arange(10)
picked = a[[1, 3, 5]]
masked = a[a > 6]
picked[0] = -1
masked[0] = -1
print(a)                           # unchanged
print(np.shares_memory(a, picked), np.shares_memory(a, masked))
```

## reshape, ravel and flatten

```python run Views where possible
import numpy as np
a = np.arange(6)
m = a.reshape(2, 3)                  # a view when possible
print(np.shares_memory(a, m))
t = m.T                              # also a view, with swapped strides
print(np.shares_memory(a, t), t.flags["C_CONTIGUOUS"])
print(np.shares_memory(a, m.ravel()))      # a view if it can be
print(np.shares_memory(a, m.flatten()))    # always a copy
```

Use `.copy()` when you need an independent array, and `np.shares_memory` or `.base` to check.

## dtypes decide memory and precision

```python run Memory by dtype
import numpy as np
n = 1_000_000
for dt in (np.float64, np.float32, np.int64, np.int32, np.int8, np.bool_):
    print(f"{np.dtype(dt).name:8}", np.zeros(n, dtype=dt).nbytes / 1e6, "MB")
```

```python run float32 loses precision
import numpy as np
x = np.float32(16_777_216)            # 2**24
print(x + np.float32(1) == x)         # the +1 is lost
print(np.float64(16_777_216) + 1)
```

## Integer overflow wraps silently

```python run Fixed-width integers wrap around
import numpy as np
a = np.array([100, 120, 127], dtype=np.int8)
print(a + np.int8(10))                # wraps: 127 + 10 becomes -119
print((a.astype(np.int16) + 10))      # widen first to be safe
```

## Copies you might not expect

```python run astype and asarray
import numpy as np
a = np.arange(3, dtype=np.float64)
print(np.shares_memory(a, a.astype(np.float64)))      # astype copies by default
print(np.shares_memory(a, np.asarray(a)))             # asarray does not, when no conversion is needed
```

## In-place operations and out=

```python run Avoid temporaries
import numpy as np
a = np.arange(5, dtype=float)
b = a * 2 + 1               # creates temporaries
a *= 2                       # in place
a += 1
np.multiply(a, 0.5, out=a)  # write into an existing array
print(b, a)
```

## In short

- Basic slices, `reshape`, `T` and `ravel` are views (writes show through); fancy and boolean indexing and `astype` copy.
- Choose the smallest dtype that is safe: `float32` halves memory but loses precision; narrow integers can overflow silently.
