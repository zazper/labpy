`merge_asof` joins each row of one table to the **most recent** row of another at or before a time, instead of requiring exact matches. It is the standard way to attach the prevailing quote or price to each trade.

```python run Attach the latest quote to each trade
import pandas as pd

trades = pd.DataFrame({
    "time": pd.to_datetime(["2026-03-02 09:30:01", "2026-03-02 09:30:05", "2026-03-02 09:30:09", "2026-03-02 09:30:12"]),
    "symbol": ["AAA", "BBB", "AAA", "BBB"],
    "qty": [100, 50, 200, 75],
})
quotes = pd.DataFrame({
    "time": pd.to_datetime(["2026-03-02 09:30:00", "2026-03-02 09:30:00", "2026-03-02 09:30:04", "2026-03-02 09:30:08"]),
    "symbol": ["AAA", "BBB", "AAA", "BBB"],
    "bid": [10.00, 20.00, 10.10, 19.90],
    "ask": [10.02, 20.04, 10.12, 19.95],
})

out = pd.merge_asof(trades, quotes, on="time", by="symbol")
out["mid"] = (out["bid"] + out["ask"]) / 2
print(out)
```

- `on` is the time column. **Both tables must be sorted by it**.
- `by` matches the symbol exactly first, then looks back in time within each symbol.
- By default the match is the last quote at or before the trade (`direction="backward"`).

## Stale matches: tolerance

Without a limit, a trade could match a quote from hours ago. `tolerance` rejects matches that are too old, leaving `NaN`.

```python run tolerance
import pandas as pd
trades = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 09:30:10", "2026-03-02 09:35:00"]), "symbol": ["AAA", "AAA"]})
quotes = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 09:30:00"]), "symbol": ["AAA"], "bid": [10.0]})

print(pd.merge_asof(trades, quotes, on="time", by="symbol"))
print(pd.merge_asof(trades, quotes, on="time", by="symbol", tolerance=pd.Timedelta("30s")))
```

## Direction and look-ahead

- `direction="backward"` (default): the latest earlier row. Use it for "what was the price when I traded".
- `direction="forward"`: the next later row. `direction="nearest"`: the closest in time.
- `allow_exact_matches=False` excludes a row with the **same timestamp**. If the quote and trade are stamped to the same instant, you may not have known the quote yet, so excluding it avoids look-ahead bias.

```python run direction and exact matches
import pandas as pd
trades = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 10:00:05"])})
px = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 10:00:00", "2026-03-02 10:00:05", "2026-03-02 10:00:09"]), "px": [1.0, 2.0, 3.0]})

print(pd.merge_asof(trades, px, on="time")["px"].iloc[0])                                  # 2.0, same instant
print(pd.merge_asof(trades, px, on="time", allow_exact_matches=False)["px"].iloc[0])        # 1.0, strictly earlier
print(pd.merge_asof(trades, px, on="time", direction="forward")["px"].iloc[0])             # 2.0
print(pd.merge_asof(trades, px, on="time", direction="forward", allow_exact_matches=False)["px"].iloc[0])  # 3.0
```

## It needs sorted keys

```python run Unsorted keys error
import pandas as pd
left = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 10:00:05", "2026-03-02 10:00:01"])})
right = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 10:00:00"]), "px": [1.0]})
pd.merge_asof(left, right, on="time")
```

Sort first with `sort_values("time")`. Also make sure the key columns have the same dtype and time zone.

## Using the result

```python run Slippage against the prevailing mid
import pandas as pd
trades = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 09:30:05"]), "symbol": ["AAA"], "price": [10.05], "side": [1]})
quotes = pd.DataFrame({"time": pd.to_datetime(["2026-03-02 09:30:04"]), "symbol": ["AAA"], "bid": [10.10], "ask": [10.12]})
t = pd.merge_asof(trades, quotes, on="time", by="symbol")
t["mid"] = (t["bid"] + t["ask"]) / 2
t["slippage"] = (t["price"] - t["mid"]) * t["side"]
print(t[["price", "mid", "slippage"]])
```

## In short

- `merge_asof` = "latest value at or before". Sort both frames by the time key, match groups with `by`, and cap staleness with `tolerance`.
- Use `allow_exact_matches=False` when same-timestamp data would not have been known yet.
