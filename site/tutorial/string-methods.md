Strings come with many built-in **methods**, called with a dot after the string.

```python run Changing case and trimming
s = "  Hello, World  "
print(s.upper())
print(s.lower())
print(s.strip())          # remove spaces at both ends
print(s.strip().title())
```

## Searching and replacing

```python run Find and replace
s = "the cat sat on the mat"
print(s.replace("cat", "dog"))
print(s.count("the"))
print(s.find("sat"))          # index, or -1 if missing
print(s.startswith("the"), s.endswith("mat"))
```

## Splitting and joining

```python run split and join
line = "red,green,blue"
colors = line.split(",")
print(colors)
print(" - ".join(colors))
print("hello world".split())     # splits on any whitespace
```

Other handy ones: `isdigit()`, `isalpha()`, `zfill()`, `center()` and `partition()`. Use `dir("text")` to list them all.
