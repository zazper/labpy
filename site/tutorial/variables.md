A **variable** is a name that refers to a value. You create one by assigning with `=`. There is no separate declaration step.

```python run Creating variables
age = 30
name = "Ada"
height = 1.68
print(name, age, height)
```

## Names can be reused

A variable can be given a new value at any time, even of a different type.

```python run Reassigning
x = 5
print(x)
x = "five"
print(x)
```

## Naming rules

- Names can contain letters, digits and underscores, but cannot start with a digit.
- Names are case-sensitive: `total` and `Total` are different.
- Use lowercase words joined by underscores, like `first_name`. This style is called snake case.
- Avoid words Python already uses, such as `if`, `for` and `class`.

## Several at once

```python run Multiple assignment
a, b, c = 1, 2, 3
x = y = 0
print(a, b, c, x, y)
```

Use `type()` to check what kind of value a variable holds.

```python run Checking a type
print(type(10), type(2.5), type("hi"), type(True))
```
