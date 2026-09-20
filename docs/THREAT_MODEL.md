# Threat Model

- **Claim overreach:** NOT_OBSERVED is bounded to the frozen source universe/window; it is never proof that an event was impossible.
- **Post-hoc source selection:** only sealing before the window yields PRECOMMITTED mode.
- **Weak coverage:** PARTIAL/UNKNOWN mandatory coverage becomes INCONCLUSIVE.
- **Source outage:** failed mandatory fetch becomes EXTERNAL_FAILURE, never NOT_OBSERVED.
- **Prompt injection:** source/user text is explicitly untrusted data in the classifier prompt.
- **Model authority:** the LLM classifies source facts only; deterministic code derives the state-changing outcome.
- **Reroll ambiguity:** INCONCLUSIVE is terminal. Only external failure can retry.
- **Receipt substitution:** downstream reads pin definition and receipt hashes.
- **Private URLs:** registration rejects HTTP, loopback and common private/local targets.
