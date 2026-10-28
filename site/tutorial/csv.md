**CSV** (comma-separated values) is a simple table format. Python's `csv` module reads and writes it.

```python run Writing a CSV file
import csv
rows = [["name", "score"], ["Ada", 95], ["Bob", 80]]
with open("scores.csv", "w", newline="") as f:
    csv.writer(f).writerows(rows)
print(open("scores.csv").read())
```

## Reading rows

```python run Reading with DictReader
import csv
text = "name,score\nAda,95\nBob,80\n"
open("scores.csv", "w").write(text)

with open("scores.csv", newline="") as f:
    for row in csv.DictReader(f):
        print(row["name"], int(row["score"]) + 5)
```

## Writing from dictionaries

```python run DictWriter
import csv, io
buffer = io.StringIO()
writer = csv.DictWriter(buffer, fieldnames=["city", "pop"])
writer.writeheader()
writer.writerow({"city": "Oslo", "pop": 700000})
print(buffer.getvalue())
```

Values read from CSV are always strings, so convert numbers yourself. For big tables, pandas is more convenient.
