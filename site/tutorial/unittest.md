`unittest` is Python's built-in test framework. A test checks that code gives the expected result.

```python run A first test
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_numbers(self):
        self.assertEqual(add(2, 3), 5)

    def test_strings(self):
        self.assertEqual(add("a", "b"), "ab")

unittest.main(argv=["ignored"], exit=False)
```

## Useful assertions

- `assertEqual(a, b)`, `assertNotEqual(a, b)`
- `assertTrue(x)`, `assertFalse(x)`
- `assertIn(a, b)`, `assertIsNone(x)`
- `assertRaises(ValueError)` as a context manager

## A failing test

```python run Reading a failure
import unittest

class TestMath(unittest.TestCase):
    def test_wrong(self):
        self.assertEqual(2 + 2, 5)

    def test_raises(self):
        with self.assertRaises(ZeroDivisionError):
            1 / 0

unittest.main(argv=["ignored"], exit=False)
```

The report shows which test failed and the values that differed. Outside LabPy you run all tests with `python -m unittest`. In a normal script, `unittest.main()` without the extra arguments is enough.
