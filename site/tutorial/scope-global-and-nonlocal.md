**Scope** decides where a name can be used. A variable made inside a function is **local** to it.

```python run Local variables
def f():
    inside = 10
    print(inside)

f()
print("done")
```

```python run Local names stay inside error
def f():
    secret = 1

f()
print(secret)
```

## Reading outer variables

A function can read variables from outside it.

```python run Reading a global
rate = 0.2

def tax(price):
    return price * rate

print(tax(50))
```

## global and nonlocal

To **assign** to an outer variable, declare it. `global` refers to a module-level name; `nonlocal` refers to a name in an enclosing function.

```python run global and nonlocal
counter = 0

def bump():
    global counter
    counter += 1

bump(); bump()
print(counter)

def outer():
    count = 0
    def inner():
        nonlocal count
        count += 1
    inner(); inner()
    return count

print(outer())
```

Python looks for a name in this order: local, enclosing functions, global, built-in (often remembered as LEGB). Prefer parameters and return values over globals.
