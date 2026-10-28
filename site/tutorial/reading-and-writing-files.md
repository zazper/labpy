Use the built-in `open()` to work with files. In LabPy, files live in a private virtual file system inside the page. Files your program creates can be downloaded from **Download > Output files**.

```python run Writing a file
f = open("hello.txt", "w")
f.write("Hello, file!\n")
f.write("A second line\n")
f.close()
print("Written")
```

```python run Reading it back
open("hello.txt", "w").write("line one\nline two\nline three\n")

f = open("hello.txt")
print(f.read())
f.close()
```

## Modes

- `"r"` read (default), `"w"` write (replaces the file), `"a"` append, `"x"` create only.
- Add `"b"` for binary, such as `"rb"`.

## Reading line by line

```python run Looping over lines
open("poem.txt", "w").write("roses\nviolets\nsugar\n")
for line in open("poem.txt"):
    print(line.strip().upper())

with open("poem.txt", "a") as f:
    f.write("and you\n")
print(open("poem.txt").readlines())
```

Looping directly over the file reads one line at a time, which keeps memory use small for big files. Always close files, or use `with` (next topic) to do it for you.
