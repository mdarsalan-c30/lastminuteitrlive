#!/usr/bin/env python3
"""
compute_cli.py — stdin JSON UserInput → stdout JSON ITRResult.

Usage (from project root):
  python3 scripts/compute_cli.py < input.json
"""
from __future__ import annotations

import json
import sys
import traceback
from dataclasses import asdict, is_dataclass
from pathlib import Path
from typing import Any

ENGINE_DIR = Path(__file__).resolve().parent.parent / "engine"
sys.path.insert(0, str(ENGINE_DIR))

from models import (  # noqa: E402
    BroughtForwardLossesInput,
    BusinessInput,
    CapitalGainsInput,
    DeductionsInput,
    DepreciationBlockInput,
    DocumentFlags,
    HousePropertyInput,
    OtherIncomeInput,
    ProfileFlags,
    SalaryInput,
    TaxPaidInput,
    UserInput,
)
from orchestrator import build_layer2_handoff, compute_itr  # noqa: E402
from rulesets import get_ruleset  # noqa: E402


def _field_names(cls) -> set[str]:
    return {f.name for f in cls.__dataclass_fields__.values()}  # type: ignore[attr-defined]


def _reject_unknown_keys(cls, data: dict, path: str) -> None:
    allowed = _field_names(cls)
    unknown = sorted(k for k in data if k not in allowed)
    if unknown:
        raise ValueError(f"Unknown field(s) at {path}: {', '.join(unknown)}")


def _build(cls, data: dict | None, path: str) -> Any:
    if not data:
        if cls is SalaryInput:
            return SalaryInput(gross_salary=0.0, basic_salary=0.0)
        return cls()
    if not isinstance(data, dict):
        raise ValueError(f"{path} must be an object")
    _reject_unknown_keys(cls, data, path)
    return cls(**data)


def _build_business(data: dict | None) -> BusinessInput:
    biz = _build(BusinessInput, data, "business")
    if data and isinstance(data.get("depreciation_blocks"), list):
        biz.depreciation_blocks = [
            _build(DepreciationBlockInput, b, f"business.depreciation_blocks[{index}]")
            for index, b in enumerate(data["depreciation_blocks"])
        ]
    return biz


def dict_to_user_input(data: dict) -> UserInput:
    _reject_unknown_keys(UserInput, data, "user")
    house_properties = [
        _build(HousePropertyInput, p, f"house_properties[{index}]")
        for index, p in enumerate(data.get("house_properties", []))
    ]
    return UserInput(
        age=int(data["age"]),
        residential_status=data.get("residential_status", "resident"),
        assessment_year=data.get("assessment_year", "2026-27"),
        mode=data.get("mode", "estimate"),
        late_filing=data.get("late_filing", False),
        salary=_build(SalaryInput, data.get("salary"), "salary"),
        house_property=_build(HousePropertyInput, data.get("house_property"), "house_property"),
        house_properties=house_properties,
        other_income=_build(OtherIncomeInput, data.get("other_income"), "other_income"),
        capital_gains=_build(CapitalGainsInput, data.get("capital_gains"), "capital_gains"),
        carry_forward=_build(BroughtForwardLossesInput, data.get("carry_forward"), "carry_forward"),
        deductions=_build(DeductionsInput, data.get("deductions"), "deductions"),
        taxes_paid=_build(TaxPaidInput, data.get("taxes_paid"), "taxes_paid"),
        business=_build_business(data.get("business")),
        profile_flags=_build(ProfileFlags, data.get("profile_flags"), "profile_flags"),
        documents=_build(DocumentFlags, data.get("documents"), "documents"),
    )


def serialize(obj: Any) -> Any:
    if is_dataclass(obj) and not isinstance(obj, type):
        return {k: serialize(v) for k, v in asdict(obj).items()}
    if isinstance(obj, list):
        return [serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: serialize(v) for k, v in obj.items()}
    return obj


def main() -> int:
    try:
        payload = json.load(sys.stdin)
        user = dict_to_user_input(payload)
        result = compute_itr(user)
        output = {
            "ok": True,
            "result": serialize(result),
            "handoff": build_layer2_handoff(result, user),
            "ruleset_id": get_ruleset(user.assessment_year).ruleset_id,
        }
        json.dump(output, sys.stdout, indent=2)
        return 0
    except Exception as exc:
        json.dump(
            {"ok": False, "error": str(exc), "trace": traceback.format_exc()},
            sys.stdout,
            indent=2,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
