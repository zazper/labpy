**Broadcasting** lets NumPy combine arrays of different shapes without copying them or writing loops. Python's loop overhead disappears and the work happens in compiled code.

## The rule

Compare shapes from the **right**. Two dimensions are compatible if they are equal, or one of them is 1 (that one is stretched). A missing dimension counts as 1.

```python run Shapes that broadcast
import numpy as np
col = np.arange(3).reshape(3, 1)     # shape (3, 1)
row = np.arange(4)                   # shape (4,)  -> treated as (1, 4)
table = col + row
print(table.shape)
print(table)
```

```python run Shapes that do not broadcast error
import numpy as np
print(np.ones((3, 2)) + np.ones(3))      # (3, 2) and (3,) do not line up
```

## Standardise every column

```python run Subtract a mean, divide by a std
import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(loc=[10, 50, 100], scale=[1, 5, 20], size=(1000, 3))

Z = (X - X.mean(axis=0)) / X.std(axis=0)        # (1000,3) vs (3,)
print(Z.mean(axis=0).round(6), Z.std(axis=0).round(6))

row_norm = X / X.sum(axis=1, keepdims=True)     # keepdims keeps shape (1000,1) so it broadcasts
print(row_norm.sum(axis=1)[:3])
```

## Replace a double loop

Pairwise distances between 300 points, first with loops and then broadcast.

```python run Loops versus broadcasting
import numpy as np, time
rng = np.random.default_rng(1)
pts = rng.random((300, 3))

start = time.perf_counter()
D_loop = np.zeros((300, 300))
for i in range(300):
    for j in range(300):
        D_loop[i, j] = np.sqrt(((pts[i] - pts[j]) ** 2).sum())
t_loop = time.perf_counter() - start

start = time.perf_counter()
diff = pts[:, None, :] - pts[None, :, :]        # (300,1,3) - (1,300,3) -> (300,300,3)
D_fast = np.sqrt((diff ** 2).sum(axis=-1))
t_fast = time.perf_counter() - start

print(np.allclose(D_loop, D_fast))
print(f"loops {t_loop:.3f}s, broadcast {t_fast:.4f}s")
```

## A finance example: discounting many cash flows at many rates

```python run Present value across a grid of rates
import numpy as np
years = np.array([1, 2, 3, 4, 5])                  # cash-flow times
cash = np.array([5, 5, 5, 5, 105.0])               # a 5% bond with face 100
rates = np.array([0.02, 0.04, 0.06])               # scenarios

factors = (1 + rates[None, :]) ** (-years[:, None])    # (5,1) and (1,3) -> (5,3)
prices = (cash[:, None] * factors).sum(axis=0)
print(prices.round(2))
```

## Pitfalls

- A `(n,)` array combined with a `(n, 1)` array gives an `(n, n)` result, which is easy to create by accident. Check `.shape`.
- Broadcasting can build large temporary arrays. A `(100_000, 1)` against `(1, 100_000)` needs 80 GB of float64.
- Use `np.newaxis` (or `None`), `reshape` and `keepdims=True` to line shapes up deliberately. `np.einsum` and `np.broadcast_to` are useful companions.

```python run Accidental outer product
import numpy as np
a = np.arange(3)           # (3,)
b = np.arange(3).reshape(3, 1)   # (3, 1)
print((a + b).shape)       # (3, 3), probably not what you meant
```

## In short

- Align shapes from the right; size 1 stretches. Add axes with `[:, None]` to control the result.
- Broadcasting replaces nested loops with one vectorised expression; watch the temporary memory.
