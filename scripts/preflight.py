from pathlib import Path
import hashlib, py_compile, sys
R=Path(__file__).resolve().parents[1]; C=R/"contracts"/"abscene.py"; F=R/"frontend"/"src"/"lib"/"genlayer.ts"
errors=[]
try: py_compile.compile(str(C),doraise=True)
except Exception as e: errors.append(str(e))
ct=C.read_text(); ft=F.read_text()
for x in ["class Abscene(gl.Contract)","run_nondet_unsafe","gl.nondet.web.get","gl.nondet.exec_prompt","can_rely_on_absence"]:
    if x not in ct: errors.append("missing "+x)
if len(list((R/"contracts").glob("*.py")))!=1: errors.append("expected exactly one deployable contract")
for x in ["CHAIN_ID = 61999","https://studio.genlayer.com/api","https://explorer-studio.genlayer.com"]:
    if x not in ft: errors.append("network lock missing "+x)
if errors:
    print("PREFLIGHT FAILED"); [print("-",e) for e in errors]; sys.exit(1)
print("PREFLIGHT PASS"); print("contract_sha256="+hashlib.sha256(C.read_bytes()).hexdigest()); print("deployable_contracts=1"); print("chain_id=61999")
