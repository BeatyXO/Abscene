from pathlib import Path
R=Path(__file__).parents[1]; C=(R/"contracts"/"abscene.py").read_text(); F=(R/"frontend"/"src"/"lib"/"genlayer.ts").read_text(); A=(R/"frontend"/"src"/"App.tsx").read_text()
def test_one_contract(): assert [p.name for p in (R/"contracts").glob("*.py")]==["abscene.py"]
def test_network_lock(): assert "CHAIN_ID = 61999" in F and "https://studio.genlayer.com/api" in F
def test_consensus_boundary(): assert "run_nondet_unsafe" in C and "gl.nondet.web.get" in C and "gl.nondet.exec_prompt" in C
def test_deterministic_outcome(): assert "def derive(" in C and "Do not choose the final contract verdict" in C
def test_precommitment_gate(): assert "PRECOMMITTED if now<int(item.window_start) else RETROSPECTIVE" in C and "can_rely_on_absence" in C
def test_frontend_explains_retrospective(): assert "RETROSPECTIVE" in A and "precommitted negative proof" in A
def test_no_fake_default_address(): assert "VITE_CONTRACT_ADDRESS || ''" in F
