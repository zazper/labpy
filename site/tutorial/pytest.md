**pytest** is a popular testing tool that is shorter to write than `unittest`. A test is a plain function named `test_...` that uses `assert`.

```python static test_math.py
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_add_strings():
    assert add("a", "b") == "ab"
```

Run it on your own computer with `pip install pytest` and then `pytest`. pytest shows detailed information when an assert fails, offers fixtures for shared setup, and can run one test with many inputs.

## The idea, in a few lines

This tiny runner shows what pytest does: find `test_` functions, run them and report.

```python run A mini test runner
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_negative():
    assert add(-1, 1) == 0

def test_fails():
    assert add(1, 1) == 3

for name, func in list(globals().items()):
    if name.startswith("test_"):
        try:
            func()
            print("PASS", name)
        except AssertionError:
            print("FAIL", name)
```

## Many inputs with parametrize

```python static Parametrize
import pytest

@pytest.mark.parametrize("a, b, expected", [(1, 2, 3), (0, 0, 0), (-1, 1, 0)])
def test_add(a, b, expected):
    assert a + b == expected
```

In LabPy, use `unittest` or plain `assert` checks. pytest itself is best run on your own machine or in the cloud runner (coming later).
