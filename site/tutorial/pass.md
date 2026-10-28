A block cannot be empty. `pass` is a statement that does nothing, used as a placeholder.

```python run pass as a placeholder
def todo():
    pass            # write this later

class Empty:
    pass

for i in range(3):
    pass            # do nothing for now

print("Program still runs")
```

## Without pass

```python run Empty block error
if True:
```

Python needs at least one statement after a colon. You can also use `...` (called Ellipsis) as a placeholder, or a docstring.
