This topic is a concept note: on your own computer, projects usually get their own **virtual environment**.

A virtual environment is a private folder of installed packages for one project, so different projects can use different versions of a library without clashing.

```bash static On your own computer
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install requests
pip freeze > requirements.txt    # record what you installed
```

## Why use one?

- Projects stay independent of each other and of the system Python.
- A `requirements.txt` lets anyone recreate the same setup.
- You can delete the folder and start again.

## And in LabPy?

LabPy gives you a fresh, isolated Python in each browser tab, so you do not need a virtual environment. Packages you load or install with `micropip` last until the tab restarts.
