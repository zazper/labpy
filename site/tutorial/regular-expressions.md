**Regular expressions** (regex) describe text patterns. Use the `re` module, and write patterns as raw strings (`r"..."`).

```python run search and findall
import re
text = "Call 555-1234 or 555-9876 today"
print(re.search(r"\d{3}-\d{4}", text).group())
print(re.findall(r"\d{3}-\d{4}", text))
```

## Common pieces

- `\d` digit, `\w` letter/digit/underscore, `\s` whitespace, `.` any character
- `*` zero or more, `+` one or more, `?` optional, `{3}` exactly three
- `[abc]` one of these, `^` start, `$` end, `( )` capture a group

## Groups and named groups

```python run Capturing groups
import re
m = re.match(r"(?P<user>\w+)@(?P<domain>[\w.]+)", "ada@example.com")
print(m.group("user"), m.group("domain"))
print(m.groups())
```

## Replacing and splitting

```python run sub and split
import re
print(re.sub(r"\s+", " ", "too    many   spaces"))
print(re.split(r"[,;]\s*", "a, b;c,  d"))
print(re.sub(r"(\d+)", lambda m: str(int(m.group()) * 2), "3 apples and 10 pears"))
```

## Checking input

```python run fullmatch
import re
for code in ["AB-1234", "ab-12", "XY-9999"]:
    print(code, bool(re.fullmatch(r"[A-Z]{2}-\d{4}", code)))
```
