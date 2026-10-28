**Special methods** (also called dunder methods, for "double underscore") let your objects work with Python's built-in features.

```python run __str__ and __repr__
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(1, 2)
print(p)
print([p])
```

## Operators

```python run __add__ and __eq__
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return (self.x, self.y) == (other.x, other.y)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

print(Vector(1, 2) + Vector(3, 4))
print(Vector(1, 1) == Vector(1, 1))
```

## Containers

```python run __len__ and __getitem__
class Playlist:
    def __init__(self, *songs):
        self.songs = list(songs)

    def __len__(self):
        return len(self.songs)

    def __getitem__(self, i):
        return self.songs[i]

p = Playlist("A", "B", "C")
print(len(p), p[1])
for song in p:
    print(song)
```
