from datetime import datetime, timezone

CONTRACT = "contracts/abscene.py"
MODEL = r"ABSCENE / SOURCE OBSERVATION V1"
OFFICIAL_LOG = 1
OTHER = 5
OBSERVED = 1
NOT_OBSERVED = 2
INCONCLUSIVE = 3
EXTERNAL_FAILURE = 4

def ts(v):
    return int(datetime.fromisoformat(v).replace(tzinfo=timezone.utc).timestamp())

def addr(name):
    from gltest.direct import create_address
    return create_address(name)

def setup(vm, deploy):
    vm.warp("2026-09-20T12:00:00+00:00")
    c = deploy(CONTRACT)
    vm.sender = addr("owner")
    cid = c.create_case(
        "Q3 disclosure observation",
        "Project Atlas publishes its Q3 security disclosure to the public.",
        "A qualifying occurrence must be the actual public disclosure, not a teaser or future promise.",
        "Observe only the frozen source universe.",
        ts("2026-09-21T00:00:00"),
        ts("2026-09-22T00:00:00"),
    )
    sid = c.add_source(
        cid,
        "Official disclosures",
        "https://example.com/disclosures",
        OFFICIAL_LOG,
        "This official log lists every disclosure and publication date throughout the complete requested window.",
        True,
    )
    return c, cid, sid

def rows(source_id, coverage, occurrence):
    return {"sources":[{"source_id":source_id,"coverage":coverage,"occurrence":occurrence}]}

def test_precommitted_seal_and_definition_hash(direct_vm, direct_deploy):
    c,cid,_ = setup(direct_vm,direct_deploy)
    definition = c.seal_case(cid)
    case = c.get_case(cid)
    assert case["mode_name"] == "PRECOMMITTED"
    assert case["status_name"] == "SEALED"
    assert case["definition_hash"] == definition
    assert len(definition) == 64

def test_source_universe_is_immutable_after_seal(direct_vm, direct_deploy):
    c,cid,_ = setup(direct_vm,direct_deploy)
    c.seal_case(cid)
    with direct_vm.expect_revert("source universe is sealed"):
        c.add_source(cid,"late","https://example.com/late",OFFICIAL_LOG,"This complete log covers the entire requested observation window.",True)

def test_retrospective_mode_is_derived_from_time(direct_vm, direct_deploy):
    c,cid,_ = setup(direct_vm,direct_deploy)
    direct_vm.warp("2026-09-21T12:00:00+00:00")
    c.seal_case(cid)
    assert c.get_case(cid)["mode_name"] == "RETROSPECTIVE"

def test_complete_coverage_can_issue_strong_not_observed(direct_vm, direct_deploy):
    c,cid,sid = setup(direct_vm,direct_deploy)
    definition = c.seal_case(cid)
    direct_vm.warp("2026-09-23T00:00:00+00:00")
    direct_vm.mock_web(r"example\.com/disclosures",{"status":200,"body":b"No Q3 disclosure entry in the official log."})
    direct_vm.mock_llm(MODEL,rows(sid,"COMPLETE","NONE"))
    assert int(c.resolve_case(cid)) == NOT_OBSERVED
    case = c.get_case(cid)
    assert case["strong_absence_receipt"] is True
    assert c.can_rely_on_absence(cid,definition,case["receipt_hash"]) is True

def test_partial_coverage_fails_closed(direct_vm, direct_deploy):
    c,cid,sid = setup(direct_vm,direct_deploy)
    c.seal_case(cid)
    direct_vm.warp("2026-09-23T00:00:00+00:00")
    direct_vm.mock_web(r"example\.com/disclosures",{"status":200,"body":b"Archive only shows the last day."})
    direct_vm.mock_llm(MODEL,rows(sid,"PARTIAL","NONE"))
    assert int(c.resolve_case(cid)) == INCONCLUSIVE

def test_in_window_occurrence_is_decisive(direct_vm, direct_deploy):
    c,cid,sid = setup(direct_vm,direct_deploy)
    c.seal_case(cid)
    direct_vm.warp("2026-09-23T00:00:00+00:00")
    direct_vm.mock_web(r"example\.com/disclosures",{"status":200,"body":b"Q3 security disclosure published September 21, 2026."})
    direct_vm.mock_llm(MODEL,rows(sid,"COMPLETE","IN_WINDOW"))
    assert int(c.resolve_case(cid)) == OBSERVED

def test_mandatory_fetch_failure_is_retryable(direct_vm, direct_deploy):
    c,cid,_ = setup(direct_vm,direct_deploy)
    c.seal_case(cid)
    direct_vm.warp("2026-09-23T00:00:00+00:00")
    direct_vm.mock_web(r"example\.com/disclosures",{"status":503,"body":b""})
    assert int(c.resolve_case(cid)) == EXTERNAL_FAILURE
    assert c.get_case(cid)["status_name"] == "RETRYABLE"

def test_retrospective_negative_never_satisfies_strong_gate(direct_vm, direct_deploy):
    c = direct_deploy(CONTRACT)
    direct_vm.sender = addr("owner")
    cid = c.create_case(
        "Past observation",
        "Project Atlas publishes its Q3 security disclosure.",
        "A qualifying occurrence is the actual public Q3 security disclosure.",
        "",
        ts("2026-09-18T00:00:00"),
        ts("2026-09-19T00:00:00"),
    )
    sid = c.add_source(cid,"Official","https://example.com/disclosures",OFFICIAL_LOG,"This complete official log covers the entire observation window.",True)
    definition = c.seal_case(cid)
    direct_vm.mock_web(r"example\.com/disclosures",{"status":200,"body":b"No entry."})
    direct_vm.mock_llm(MODEL,rows(sid,"COMPLETE","NONE"))
    assert int(c.resolve_case(cid)) == NOT_OBSERVED
    case = c.get_case(cid)
    assert case["mode_name"] == "RETROSPECTIVE"
    assert c.can_rely_on_absence(cid,definition,case["receipt_hash"]) is False
