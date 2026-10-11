from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["service"] == "DrainPulse AI"


def test_dashboard_summary_has_core_metrics():
    with TestClient(app) as client:
        response = client.get("/api/dashboard")
        assert response.status_code == 200
        payload = response.json()
        assert payload["summary"]["total_assets"] >= 1
        assert "risk_index" in payload["summary"]
        assert len(payload["top_assets"]) >= 1


def test_report_submission_and_asset_lookup():
    with TestClient(app) as client:
        report_response = client.post(
            "/api/submit-report",
            json={
                "title": "Blocked inlet near Vasant Kunj",
                "description": "Plastic litter and silt near the culvert mouth.",
                "lat": 28.542,
                "lon": 77.155,
                "severity": "medium",
                "reporter_type": "citizen",
                "status": "new",
                "photo_url": "/images/test.jpg",
            },
        )
        assert report_response.status_code == 200

        assets_response = client.get("/api/assets")
        assert assets_response.status_code == 200
        assert len(assets_response.json()) >= 1


def test_blockage_assessment_endpoint():
    with TestClient(app) as client:
        response = client.post(
            "/api/assess-blockage",
            json={
                "drain_id": 1,
                "visible_waste": 80,
                "silt_depth": 60,
                "standing_water": 45,
                "flow_obstruction": 75,
                "description": "Debris and standing water at the inlet.",
            },
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] in {"low", "moderate", "high", "critical"}
        assert 0 <= payload["score"] <= 100
        assert 0 <= payload["confidence"] <= 1


def test_auth_session_and_tenant_context_are_applied():
    with TestClient(app) as client:
        login = client.post(
            "/api/auth/login",
            json={"email": "tenant-a@drainpulse.local", "role": "supervisor", "tenant_id": "tenant-a"},
        )
        assert login.status_code == 200
        token = login.json()["token"]

        session = client.get(
            "/api/auth/session",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert session.status_code == 200
        assert session.json()["tenant_id"] == "tenant-a"
        assert session.json()["role"] == "supervisor"

        assets = client.get(
            "/api/assets",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert assets.status_code == 200
        for asset in assets.json():
            assert asset["tenant_id"] in {"default", "tenant-a"}
