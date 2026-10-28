The built-in `input()` function waits for the user to type something and returns it as a **string**.

```python run Ask for a name
name = input("What is your name? ")
print("Nice to meet you,", name)
```

In LabPy a box pops up asking for your answer. Cancelling gives an empty string.

## Input is always text

Convert it if you need a number.

```python run Convert input to a number
age = int(input("How old are you? "))
print("Next year you will be", age + 1)
```

If the text cannot be converted, Python raises a `ValueError`. The Errors topics show how to handle that.
