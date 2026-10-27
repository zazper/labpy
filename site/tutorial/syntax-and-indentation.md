Python reads your program from top to bottom, one statement per line. Unlike many languages, Python uses **indentation** (spaces at the start of a line) to show which lines belong together.

## Your first program

```python run Your first program
print("Hello, LabPy!")
```

`print()` is a built-in function that shows text in the output panel. Text in quotes is called a **string**.

## Indentation groups code

Lines that belong together share the same indentation. The usual choice is four spaces. A line ending in a colon (`:`) starts a block, and the indented lines after it are inside that block.

```python run Indentation groups code
if 5 > 2:
    print("Five is greater than two")
    print("This line is in the same block")
print("This line is outside the block")
```

## Common mistakes

- Indenting a line that should not be indented, which raises an `IndentationError`.
- Mixing tabs and spaces in the same file.
- Forgetting the colon at the end of a line like `if` or `for`.

```python run What an indentation error looks like
print("Start")
    print("Oops")
```
