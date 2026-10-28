**Operators** combine values. Here are the main groups.

## Arithmetic and assignment

```python run Arithmetic and assignment
x = 10
x += 5     # same as x = x + 5
x *= 2
print(x)
print(7 // 2, 7 % 2, 2 ** 3)
```

## Comparison

`==`, `!=`, `<`, `>`, `<=` and `>=` give `True` or `False`. Python lets you chain them.

```python run Comparisons
age = 25
print(18 <= age < 65)
print(age != 30)
```

## Logical

`and`, `or` and `not` combine conditions.

```python run Logical operators
a, b = True, False
print(a and b, a or b, not a)
```

## Membership and identity

```python run in, is
print(3 in [1, 2, 3])
print("x" not in "abc")
a = [1]
b = [1]
print(a == b)   # same contents
print(a is b)   # same object?
```

## Precedence

Multiplication happens before addition, `not` before `and` before `or`. Use parentheses to make your intent clear.

```python run Precedence
print(2 + 3 * 4)
print((2 + 3) * 4)
```
