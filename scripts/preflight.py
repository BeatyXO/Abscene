from pathlib import Path
import hashlib
import py_compile
import sys

ROOT = Path(__file__).resolve().parents[1]
CONTRACT = ROOT / "contracts" / "abscene.py"
FRONTEND = ROOT / "frontend" / "src" / "lib" / "genlayer.ts"
README = ROOT / "README.md"

errors: list[str] = []

try:
    py_compile.compile(str(CONTRACT), doraise=True)
except Exception as exc:
    errors.append(f"contract syntax: {exc}")

contract_text = CONTRACT.read_text(encoding="utf-8")
frontend_text = FRONTEND.read_text(encoding="utf-8")
readme_text = README.read_text(encoding="utf-8")

required_contract_markers = [
    "class Abscene(gl.Contract)",
    "run_nondet_unsafe",
    "gl.nondet.web.get",
    "gl.nondet.exec_prompt",
    "def can_rely_on_absence",
    "def is_observed",
    "MODE_PRECOMMITTED",
    "OUTCOME_NOT_OBSERVED",
]

for marker in required_contract_markers:
    if marker not in contract_text:
        errors.append(f"missing contract marker: {marker}")

python_contracts = sorted((ROOT / "contracts").glob("*.py"))
if len(python_contracts) != 1:
    errors.append(f"expected exactly one deployable Python contract, found {len(python_contracts)}")

network_markers = [
    "CHAIN_ID = 61999",
    "https://studio.genlayer.com/api",
    "https://explorer-studio.genlayer.com",
]
for marker in network_markers:
    if marker not in frontend_text:
        errors.append(f"frontend network lock missing: {marker}")

for marker in ("Chain ID: `61999`", "one Intelligent Contract", "PRECOMMITTED", "RETROSPECTIVE"):
    if marker not in readme_text:
        errors.append(f"README marker missing: {marker}")

digest = hashlib.sha256(CONTRACT.read_bytes()).hexdigest()

if errors:
    print("PRELIGHT FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("PREFLIGHT PASS")
print(f"contract_sha256={digest}")
print("deployable_contracts=1")
print("network=studionet")
print("chain_id=61999")
