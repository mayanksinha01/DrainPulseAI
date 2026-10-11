from __future__ import annotations

from app.schemas import BlockageAssessmentRequest, BlockageAssessmentResponse


def assess_blockage(request: BlockageAssessmentRequest) -> BlockageAssessmentResponse:
    waste = max(0.0, min(1.0, request.visible_waste / 100.0))
    silt = max(0.0, min(1.0, request.silt_depth / 100.0))
    standing = max(0.0, min(1.0, request.standing_water / 100.0))
    obstruction = max(0.0, min(1.0, request.flow_obstruction / 100.0))

    score = round(
        (waste * 0.35 + silt * 0.25 + standing * 0.2 + obstruction * 0.2) * 100,
        1,
    )
    confidence = round(min(0.99, 0.55 + (score / 100) * 0.4), 2)

    if score >= 75:
        status = "critical"
        recommendation = "Dispatch emergency crew and clear blockage before the next rainfall pulse."
    elif score >= 55:
        status = "high"
        recommendation = "Schedule desilting and remove obstructing waste within the next work shift."
    elif score >= 35:
        status = "moderate"
        recommendation = "Monitor inlet condition and plan preventive cleaning in the next inspection round."
    else:
        status = "low"
        recommendation = "Routine observation; no immediate intervention required under current conditions."

    return BlockageAssessmentResponse(
        drain_id=request.drain_id,
        score=score,
        confidence=confidence,
        status=status,
        recommendation=recommendation,
    )
