**matplotlib** draws charts. Call `plt.show()` and LabPy displays the plot under the output.

```python run A line plot
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 100)
plt.plot(x, np.sin(x), label="sin")
plt.plot(x, np.cos(x), label="cos")
plt.title("Waves")
plt.xlabel("x")
plt.legend()
plt.show()
```

## Bar charts

```python run A bar chart
import matplotlib.pyplot as plt
names = ["Ada", "Bob", "Cy"]
scores = [90, 75, 82]
plt.bar(names, scores, color="#f0b429")
plt.ylabel("Score")
plt.title("Test scores")
plt.show()
```

## Scatter and histogram

```python run Several plots in one figure
import numpy as np
import matplotlib.pyplot as plt
rng = np.random.default_rng(0)
x = rng.normal(size=200)
y = x + rng.normal(scale=0.5, size=200)

fig, (left, right) = plt.subplots(1, 2, figsize=(8, 3))
left.scatter(x, y, s=10)
left.set_title("Scatter")
right.hist(x, bins=15)
right.set_title("Histogram")
plt.tight_layout()
plt.show()
```

You can download a plot with `plt.savefig("chart.png")`; the file then appears under **Download > Output files**.
