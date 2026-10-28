Python programmers follow a shared style guide called **PEP 8**. Following it makes your code easy for others to read.

## Naming conventions

- Variables and functions: `lower_case_with_underscores`
- Classes: `CapitalizedWords`
- Constants: `ALL_CAPITALS`
- Indent with four spaces and keep lines to about 88 characters (the Ruff formatter in LabPy uses 88).

```python run PEP 8 names
MAX_USERS = 100            # a constant

def total_price(price, count):    # function: snake_case
    return price * count

class ShoppingCart:               # class: CapWords
    pass

item_count = 3                    # variable: snake_case
print(total_price(2.5, item_count))
```

## Let tools help

Press **Format** to fix spacing and layout automatically, and **Check** to find unused imports and variables.
