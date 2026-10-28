A **dictionary** stores **key: value** pairs. Look up a value by its key.

```python run Creating and reading a dictionary
person = {"name": "Ada", "age": 36}
print(person["name"])
print(person.get("city", "unknown"))   # safe lookup with a default
print(len(person))
```

## Changing a dictionary

```python run Add, change, delete
person = {"name": "Ada"}
person["age"] = 36          # add
person["name"] = "Ada L."   # change
del person["age"]           # delete
print(person)
```

## Looping

```python run Loop over a dictionary
prices = {"apple": 0.5, "pear": 0.75}
for key in prices:
    print(key, prices[key])
for key, value in prices.items():
    print(f"{key}: {value}")
```

## Missing keys

```python run Missing key error
data = {"a": 1}
print(data["b"])
```

Use `in` to test for a key: `"a" in data`. Keys must be unchanging values such as strings, numbers or tuples.
