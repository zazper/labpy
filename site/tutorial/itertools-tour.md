The `itertools` module offers fast building blocks for working with iterators.

```python run count, cycle and islice
from itertools import count, cycle, islice
print(list(islice(count(10), 5)))
print(list(islice(cycle("AB"), 5)))
```

## Combining

```python run chain, zip_longest
from itertools import chain, zip_longest
print(list(chain([1, 2], [3], [4, 5])))
print(list(zip_longest("ab", [1, 2, 3], fillvalue="-")))
```

## Combinatorics

```python run product, permutations, combinations
from itertools import product, permutations, combinations
print(list(product("AB", [1, 2])))
print(list(permutations([1, 2, 3], 2)))
print(list(combinations([1, 2, 3, 4], 2)))
```

## Grouping and accumulating

```python run groupby and accumulate
from itertools import groupby, accumulate
data = sorted(["apple", "avocado", "banana", "blueberry", "cherry"])
for letter, items in groupby(data, key=lambda w: w[0]):
    print(letter, list(items))
print(list(accumulate([1, 2, 3, 4])))
```

`groupby` only groups neighbouring items, so sort the data first.
