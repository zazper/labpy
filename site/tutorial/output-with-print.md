The `print()` function sends text to the output panel. It is the quickest way to see what your program is doing.

## Printing values

```python run Print text and numbers
print("Hello")
print(42)
print(3.5 + 1)
```

You can print several values at once. Python puts a space between them.

```python run Print several values
name = "Ada"
print("Hello,", name, "you are", 36)
```

## Changing the separator and the ending

`print()` has two optional settings: `sep` is placed between values, and `end` is placed after the last one (a new line by default).

```python run sep and end
print("a", "b", "c", sep="-")
print("loading", end="...")
print("done")
```

## Building text with f-strings

Put an `f` before the quotes and write values inside curly braces.

```python run f-strings
price = 4.5
count = 3
print(f"{count} items cost {price * count}")
```
