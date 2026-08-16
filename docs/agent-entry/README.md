# Agent entry

The door handle: a single public document an operator can hand to any capable AI
agent that has never seen TIBER, plus the contract that agent returns.

| File | What it is |
|---|---|
| `tiber-agent-entry-v0.md` | **The public resource.** Self-contained, provider-neutral. This is the file whose URL gets handed to an external agent. |
| `user-zero-test-procedure-v0.md` | How the pilot runs, how it is judged, and the cross-provider follow-up. |
| `../contracts/agent-thesis-proposal-v0.md` | Contract decisions, what was reused, and the contamination register. |
| `../../schemas/v0/agent-thesis-proposal.schema.json` | The machine-readable output contract. |
| `../../fixtures/agent-entry/` | Two validating examples, deliberately different shapes, deliberately non-football. |

## The URL

The repository is public, so `raw.githubusercontent.com` serves the document to
an unauthenticated agent with no token and no client.

**Commit-pinned (use this for the pilot):**

```text
https://raw.githubusercontent.com/Prometheus-Frameworks/TIBER-Research/<commit-sha>/docs/agent-entry/tiber-agent-entry-v0.md
```

**Branch address (mutable content, stable address):**

```text
https://raw.githubusercontent.com/Prometheus-Frameworks/TIBER-Research/main/docs/agent-entry/tiber-agent-entry-v0.md
```

Pin to a commit for User Zero and for the cross-provider test. Both runs must
meet a byte-identical document or the comparison means nothing, and `main`
cannot promise that across a merge. The `main` address is the right one to
publish once the protocol stabilizes.

The pinned SHA is recorded in the pull request rather than in this file, because
a file that contains its own commit hash cannot be written before the commit
exists.

Before handing the URL to an agent, fetch it from a logged-out client to confirm
it resolves anonymously.

## Validating what comes back

```bash
npm run cli -- agent-entry . path/to/proposal.json
```

Exit status is non-zero on any failure and the report lists every error found.

Agent output is **not** required to be byte-normalized — it arrives from an
arbitrary provider over a conversation, so only its meaning is checked. During a
pilot, record validation failures rather than repairing them; an edited object
cannot answer the question the pilot is asking.

## Status

Draft. Not adopted, not activated, not executed. The protocol defines no thesis
taxonomy in v0 by design — discovering what structures actually emerge is the
point of the pilot, not a gap to be filled in before it.
