**SciPy** adds scientific tools on top of NumPy: statistics, optimization, integration, interpolation and more. It loads on import (the first time can take a while).

```python run Statistics
from scipy import stats
a = [82, 85, 88, 75, 91, 79, 84]
b = [78, 74, 80, 70, 85, 72, 77]
result = stats.ttest_ind(a, b)
print(round(result.statistic, 2), round(result.pvalue, 4))
print(stats.describe(a).mean)
```

## Finding a minimum

```python run Optimization
from scipy import optimize
f = lambda x: (x - 3) ** 2 + 2
result = optimize.minimize_scalar(f)
print(round(result.x, 3), round(result.fun, 3))
```

## Integration

```python run Integration
from scipy import integrate
import math
area, error = integrate.quad(math.sin, 0, math.pi)
print(round(area, 6))
```

## Interpolation

```python run Interpolation
import numpy as np
from scipy import interpolate
x = np.array([0, 1, 2, 3])
y = np.array([0, 1, 4, 9])
f = interpolate.interp1d(x, y, kind="quadratic")
print(float(f(1.5)))
```
