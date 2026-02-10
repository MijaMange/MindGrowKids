# Rollback – design foundation branch

Use this if you want to **undo all design foundation changes** and return to the state before this work.

---

## 1. Switch back to main

```bash
git checkout main
```

You are now on `main`. The branch `ux-polish/design-foundation` still exists with all commits.

---

## 2. Revert the commits (stay on main)

If you want to **keep** the branch but bring `main` back to how it was before the design foundation:

- The design foundation work is **only on the branch** `ux-polish/design-foundation`.
- `main` was never updated; you created the branch from `main` and made new commits on the branch.
- So **no revert on main is needed** – just use `git checkout main` and you already have the pre–design foundation state.

If you had **merged** the branch into `main` and want to undo that:

```bash
git checkout main
git revert -m 1 <merge-commit-hash>
```

---

## 3. Delete the branch (optional)

To remove the design foundation branch locally:

```bash
git branch -D ux-polish/design-foundation
```

To remove it on the remote (if you had pushed it):

```bash
git push origin --delete ux-polish/design-foundation
```

---

## 4. Reflog (last resort)

If you can’t find the right commit or branch:

```bash
git reflog
```

Find the commit you want (e.g. `HEAD@{2}` before the design foundation work), then:

```bash
git checkout <commit-hash>
# or create a new branch from it:
git checkout -b recovery <commit-hash>
```

---

## Summary

| Goal                         | Command / note                                      |
|-----------------------------|------------------------------------------------------|
| Use app without design foundation | `git checkout main`                             |
| Remove branch locally       | `git branch -D ux-polish/design-foundation`         |
| Remove branch on remote     | `git push origin --delete ux-polish/design-foundation` |
| Find previous state        | `git reflog` then `git checkout <hash>` or new branch |

The **checkpoint commit** on the branch is:  
`chore: checkpoint before design foundation`  
You can return to that exact state with:

```bash
git checkout ux-polish/design-foundation
git reset --hard <checkpoint-commit-hash>
```

To get the checkpoint hash:  
`git log ux-polish/design-foundation --oneline` and use the commit after "checkpoint before design foundation" (the one before the first "style: apply design foundation...").
