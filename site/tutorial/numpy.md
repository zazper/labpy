**NumPy** provides fast arrays for numbers. It loads automatically when you import it (the first time takes a moment to download).

```python run Creating arrays
import numpy as np
a = np.array([1, 2, 3, 4])
print(a, a.shape, a.dtype)
print(np.arange(0, 10, 2))
print(np.linspace(0, 1, 5))
print(np.zeros((2, 3)))
```

## Whole-array maths

Operations apply to every element at once, with no loop.

```python run Vectorised operations
import numpy as np
a = np.array([1, 2, 3, 4])
print(a * 10)
print(a ** 2)
print(a + np.array([10, 20, 30, 40]))
print(a.sum(), a.mean(), a.max())
```

## Indexing and masks

```python run Slicing and boolean masks
import numpy as np
m = np.arange(12).reshape(3, 4)
print(m)
print(m[1, 2], m[:, 0], m[0:2, 1:3])
print(m[m % 2 == 0])
```

## Random numbers

```python run Random data
import numpy as np
rng = np.random.default_rng(seed=1)
data = rng.normal(loc=50, scale=10, size=1000)
print(round(data.mean(), 1), round(data.std(), 1))
```
