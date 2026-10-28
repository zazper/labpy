`pathlib` treats file paths as objects, which is cleaner than joining strings.

```python run Building paths
from pathlib import Path
p = Path("data") / "report.txt"
print(p)
print(p.name, p.stem, p.suffix, p.parent)
```

## Reading, writing and checking

```python run Reading and writing with Path
from pathlib import Path
note = Path("note.txt")
note.write_text("remember the milk\n")
print(note.exists(), note.stat().st_size)
print(note.read_text().strip())
```

## Folders and searching

```python run mkdir, glob and iterdir
from pathlib import Path
folder = Path("reports")
folder.mkdir(exist_ok=True)
for n in range(3):
    (folder / f"day{n}.txt").write_text(str(n))

print(sorted(p.name for p in folder.glob("*.txt")))
print(len(list(folder.iterdir())))
```

Other handy pieces: `Path.cwd()`, `path.with_suffix(".csv")`, `path.unlink()` to delete, and `path.rename()`.
