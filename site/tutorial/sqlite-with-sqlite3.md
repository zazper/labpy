`sqlite3` gives you a small SQL database that needs no server. Using `":memory:"` keeps it in memory; use a filename to save it.

```python run Create, insert and query
import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE people (name TEXT, age INTEGER)")
con.executemany("INSERT INTO people VALUES (?, ?)",
                [("Ada", 36), ("Bob", 25), ("Cy", 30)])
con.commit()

for row in con.execute("SELECT name, age FROM people WHERE age > ? ORDER BY age", (26,)):
    print(row)
```

Always pass values with `?` placeholders, never by pasting them into the SQL text, which prevents SQL injection.

## Named columns and summaries

```python run Row factory and aggregates
import sqlite3
con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row
con.execute("CREATE TABLE sales (item TEXT, qty INTEGER)")
con.executemany("INSERT INTO sales VALUES (?, ?)",
                [("pen", 3), ("pen", 2), ("book", 1)])

for r in con.execute("SELECT item, SUM(qty) AS total FROM sales GROUP BY item"):
    print(r["item"], r["total"])
```

## Updating and deleting

```python run UPDATE and DELETE
import sqlite3
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT)")
con.execute("INSERT INTO t (v) VALUES ('a'), ('b')")
con.execute("UPDATE t SET v = 'z' WHERE id = 1")
con.execute("DELETE FROM t WHERE id = 2")
print(con.execute("SELECT * FROM t").fetchall())
```
