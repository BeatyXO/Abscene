from pathlib import Path

ROOT = Path(__file__).parents[1]
CONTRACT = (ROOT / "contracts" / "abscene.py").read_text(encoding="utf-8")
CLIENT = (ROOT / "frontend" / "src" / "lib" / "genlayer.ts").read_text(encoding="utf-8")
APP = (ROOT / "frontend" / "src" / "App.tsx").read_text(encoding="utf-8")


def test_exactly_one_contract_source():
    assert [p.name for p in (ROOT / "contracts").glob("*.py")] == ["abscene.py"]


def test_studionet_61999_is_locked_in_frontend():
    assert "CHAIN_ID = 61999" in CLIENT
    assert "CHAIN_HEX = '0xf22f'" in CLIENT
    assert "https://studio.genlayer.com/api" in CLIENT
    assert "https://explorer-studio.genlayer.com" in CLIENT


def test_contract_uses_custom_consensus_and_external_fetch_inside_contract():
    assert "gl.vm.run_nondet_unsafe" in CONTRACT
    assert "gl.nondet.web.get" in CONTRACT
    assert "gl.nondet.exec_prompt" in CONTRACT


def test_final_outcome_is_deterministic_not_model_selected():
    assert "def _derive_outcome(" in CONTRACT
    assert "Do not choose the final contract verdict" in CONTRACT
    assert "OUTCOME_NOT_OBSERVED" in CONTRACT


def test_precommitment_is_derived_from_seal_time():
    assert "MODE_PRECOMMITTED if now < int(item.window_start) else MODE_RETROSPECTIVE" in CONTRACT
    assert "def can_rely_on_absence" in CONTRACT


def test_retrospective_receipts_are_explained_in_ui():
    assert "RETROSPECTIVE" in APP
    assert "cannot satisfy the strong absence gate" in APP


def test_frontend_does_not_embed_fake_canonical_address():
    # Empty default is intentional until deployment.
    assert "VITE_CONTRACT_ADDRESS || ''" in CLIENT


def test_env_example_keeps_canonical_address_empty():
    example = (ROOT / ".env.example").read_text(encoding="utf-8")
    assert "VITE_CONTRACT_ADDRESS=" in example
    assert "VITE_CONTRACT_ADDRESS=0x" not in example


def test_lifecycle_evidence_has_no_fabricated_deployment_facts():
    import json

    evidence = json.loads((ROOT / "docs" / "studionet-lifecycle.json").read_text(encoding="utf-8"))
    assert evidence["network"]["chain_id"] == 61999
    assert evidence["deployment"]["status"] == "unverified"
    assert evidence["deployment"]["contract_address"] is None
    assert evidence["cases"] == []
