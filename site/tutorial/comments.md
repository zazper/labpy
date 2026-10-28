A **comment** is a note for people reading the code. Python ignores everything from a `#` to the end of the line.

```python run Comments
# This whole line is a comment
print("Hello")  # a comment after code
```

## Good uses of comments

- Explain **why** the code does something, not what it obviously does.
- Leave a short note about a tricky step.
- Temporarily switch off a line while you test.

```python run Commenting out code
print("This runs")
# print("This does not run")
```

Python has no special multi-line comment. Put a `#` at the start of each line. Text in triple quotes is a string, not a comment, although it is used for **docstrings** (see the Docstrings topic).
