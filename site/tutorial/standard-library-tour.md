Python comes with a huge **standard library**. Here are some favourites.

## collections

```python run Counter, defaultdict, deque
from collections import Counter, defaultdict, deque

print(Counter("mississippi").most_common(2))

groups = defaultdict(list)
for word in ["apple", "avocado", "banana"]:
    groups[word[0]].append(word)
print(dict(groups))

queue = deque([1, 2, 3])
queue.appendleft(0)
print(queue.pop(), list(queue))
```

## random and statistics

```python run random and statistics
import random, statistics
random.seed(42)                  # same results every run
print(random.randint(1, 6), random.choice(["a", "b", "c"]))
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(statistics.mean(data), statistics.median(data), statistics.stdev(data))
```

## math, textwrap and string

```python run More modules
import math, textwrap, string
print(math.gcd(12, 18), math.factorial(5))
print(textwrap.fill("The quick brown fox jumps over the lazy dog", width=20))
print(string.ascii_lowercase[:5], string.digits)
```

Other useful modules: `datetime`, `json`, `re`, `pathlib`, `itertools`, `functools`, `os`, `sys` and `time`. Browse them all in the Python documentation under "The Python Standard Library".
