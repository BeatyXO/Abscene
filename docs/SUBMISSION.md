# Submission Notes

## One-line description
Abscene is a one-contract GenLayer observation protocol that produces bounded receipts for whether a precisely defined event was observed inside a frozen public source universe and time window.

## GenLayer fit
The nondeterministic problem is semantic source coverage and event interpretation. Validators inspect the same frozen sources; deterministic code derives the final result.

## Distinguishing mechanisms
Precommitted vs retrospective mode, explicit source coverage rules, asymmetric positive/negative evidence, mandatory-source fail-closed logic, first-class INCONCLUSIVE, infrastructure-only retry, prompt-injection separation, and typed hash-bound absence receipts.

## Live proof required before submission
Demonstrate OBSERVED; precommitted NOT_OBSERVED with can_rely_on_absence=true; retrospective NOT_OBSERVED with the gate false; INCONCLUSIVE from incomplete coverage; EXTERNAL_FAILURE followed by retry with an unchanged definition hash. Record deployment tx, contract address, source SHA-256, finality and frontend URL only after they are actually observed.
