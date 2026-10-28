# LabPy Documents

Index of design and planning documents. Update this table whenever a document changes version.

| Document | Current version | Purpose |
|---|---|---|
| [FEATURES_v1.2.md](FEATURES_v1.2.md) | 1.2 | Feature catalog with usefulness and difficulty ratings |
| [ROADMAP_v1.2.md](ROADMAP_v1.2.md) | 1.2 | Phased plan, optional mobile track, dependencies |
| [PRICING_v1.2.md](PRICING_v1.2.md) | 1.2 | Pricing model and metering |
| [RUNNER_DESIGN_v1.0.md](RUNNER_DESIGN_v1.0.md) | 1.0 | Paid cloud runner: large files, threads, multiprocessing |
| [TUTORIAL_TOC_v1.1.md](TUTORIAL_TOC_v1.1.md) | 1.1 | Python tutorial topic list (by topic), levels, flags, first release set |
| [MOBILE_APP_v1.1.md](MOBILE_APP_v1.1.md) | 1.1 | Optional Android and iPhone app: risks, gates, follow-ups |
| [COLLAB_DESIGN_v1.0.md](COLLAB_DESIGN_v1.0.md) | 1.0 | Collaboration design (parked; usage under review) |

## Versioning convention
- Format: `MAJOR.MINOR`. File name: `NAME_vMAJOR.MINOR.md`. The same version appears under the title and in the Document history table at the end.
- **MINOR** (1.1 to 1.2): additions, clarifications, new rows or sections.
- **MAJOR** (1.x to 2.0): a change of direction or a large rewrite.
- To release a new version: edit the content, add a history row, bump the version line, then `git mv NAME_vOLD.md NAME_vNEW.md`.
- When a file is renamed, update links in other documents and the table above. Older versions remain available in git history.
