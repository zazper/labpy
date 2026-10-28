`return` ends the function and hands a value back.

```python run Returning a value
def area(width, height):
    return width * height

print(area(3, 4))
```

## Returning several values

Returning a tuple lets you hand back more than one thing; unpack it when you call.

```python run Multiple return values
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 9, 1, 7])
print(low, high)
```

## Early return

`return` can leave a function early, which keeps code flat.

```python run Early return
def sign(n):
    if n < 0:
        return "negative"
    if n == 0:
        return "zero"
    return "positive"

print(sign(-3), sign(0), sign(8))
```

## No return means None

```python run None result
def hello():
    print("hi")

x = hello()
print(x)
```
