`elif` (short for "else if") checks another condition when the earlier ones were false. `else` runs when none of them were true.

```python run elif and else
score = 72
if score >= 90:
    print("A")
elif score >= 70:
    print("B")
elif score >= 50:
    print("C")
else:
    print("Try again")
```

Python checks the conditions from top to bottom and runs only the first block that is true. Try changing `score`.

## Only else

```python run if with else
age = 16
if age >= 18:
    print("Adult")
else:
    print("Minor")
```

Order matters: put the most specific condition first, or a broader test may catch the value before it is reached.
