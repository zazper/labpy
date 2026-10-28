**JSON** is a text format for structured data, used by most web services. The `json` module converts between Python objects and JSON text.

```python run To and from JSON
import json
data = {"name": "Ada", "langs": ["Python", "C"], "active": True, "boss": None}

text = json.dumps(data)
print(text)
print(json.loads(text)["langs"])
```

## Pretty printing

```python run Indentation and sorting
import json
print(json.dumps({"b": 2, "a": [1, 2]}, indent=2, sort_keys=True))
```

## Files

```python run json.dump and json.load
import json
settings = {"theme": "dark", "size": 14}
with open("settings.json", "w") as f:
    json.dump(settings, f, indent=2)

with open("settings.json") as f:
    print(json.load(f))
```

## Bad JSON

```python run Invalid JSON error
import json
json.loads("{'single': 'quotes'}")
```

Python `True`, `None` and tuples become `true`, `null` and arrays. Dates and custom classes are not supported directly.
