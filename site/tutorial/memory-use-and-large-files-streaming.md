Loading a whole file into memory fails when the file is huge. The answer is to **stream**: read and process a little at a time, keeping only what you need.

## Line by line

Looping over an open file reads one line at a time.

```python run Streaming a file
# make a sample file of 100,000 lines
with open("numbers.txt", "w") as f:
    for i in range(100_000):
        f.write(f"{i}\n")

total = 0
with open("numbers.txt") as f:
    for line in f:              # one line in memory at a time
        total += int(line)
print(total)
```

## Generators in a pipeline

```python run A generator pipeline
def lines(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

def evens(rows):
    for row in rows:
        if int(row) % 2 == 0:
            yield row

open("n.txt", "w").write("\n".join(str(i) for i in range(20)))
print(sum(1 for _ in evens(lines("n.txt"))))
```

## Chunks for big tables

On the cloud runner you can upload files far larger than a browser can hold and process them in chunks:

```python cloud Reading a CSV in chunks
import csv, tracemalloc

# create a large file to practise on (one million rows here; the same code works for far larger files)
with open("big.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "value"])
    for i in range(1_000_000):
        w.writerow([i, i % 100])

tracemalloc.start()
rows = total = 0
with open("big.csv", newline="") as f:
    for row in csv.DictReader(f):
        rows += 1
        total += int(row["value"])
peak = tracemalloc.get_traced_memory()[1] / 1e6
print(rows, total, f"peak memory {peak:.1f} MB")
```

The peak memory stays small however many rows there are. With pandas the same idea is `pd.read_csv(path, chunksize=100_000)`.
