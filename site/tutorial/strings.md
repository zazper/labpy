A **string** is a sequence of characters. Write strings in single or double quotes. Triple quotes allow several lines.

```python run Creating strings
a = "Hello"
b = 'World'
c = """This string
spans two lines"""
print(a, b)
print(c)
```

## Working with strings

```python run Common operations
text = "Python"
print(len(text))          # length
print(text[0], text[-1])  # first and last character
print(text + " rocks")    # join strings
print(text * 3)           # repeat
print("th" in text)       # contains
```

## Strings cannot be changed

Strings are **immutable**: operations make new strings.

```python run Immutable strings
word = "cat"
new_word = "b" + word[1:]
print(word, new_word)
```

## Escapes

A backslash begins a special character: `\n` is a new line and `\t` is a tab. Put an `r` before the quotes for a raw string, which keeps backslashes as they are.

```python run Escapes and raw strings
print("Line one\nLine two")
print(r"C:\new\table")
```
