from __future__ import annotations

import hashlib
import secrets
from typing import Any

from fastapi import HTTPException, Request

DEFAULT_TENANT_ID = "default"
DEMO_SESSIONS: dict[str, dict[str, str]] = {}


def _normalize_role(role: str | None) -> str:
    return (role or "operator").strip().lower()


def _normalize_tenant_id(tenant_id: str | None) -> str:
    value = (tenant_id or DEFAULT_TENANT_ID).strip()
    return value or DEFAULT_TENANT_ID


def _header_value(request: Request, *names: str) -> str:
    for name in names:
        value = request.headers.get(name)
        if value is not None and value.strip():
            return value.strip()
    return ""


def create_demo_session(email: str, role: str = "operator", tenant_id: str = DEFAULT_TENANT_ID) -> dict[str, str]:
    normalized_role = _normalize_role(role)
    normalized_tenant = _normalize_tenant_id(tenant_id)
    token = hashlib.sha256(
        f"{email}:{normalized_role}:{normalized_tenant}:{secrets.token_hex(8)}".encode("utf-8")
    ).hexdigest()
    context = {
        "email": email,
        "role": normalized_role,
        "tenant_id": normalized_tenant,
        "token": token,
    }
    DEMO_SESSIONS[token] = context
    return context


def get_request_context(request: Request) -> dict[str, str]:
    token = ""
    auth_header = _header_value(request, "authorization", "Authorization")
    if auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    if not token:
        token = _header_value(request, "x-drainpulse-token", "x-drainpulse-token")

    if token and token in DEMO_SESSIONS:
        return DEMO_SESSIONS[token]

    fallback_role = _normalize_role(
        _header_value(
            request,
            "x-user-role",
            "X-User-Role",
            "x-role",
            "role",
            "operator",
        )
    )
    fallback_tenant = _normalize_tenant_id(
        _header_value(request, "x-tenant-id", "x-tenant", "tenant-id", "tenant")
    )
    fallback_email = _header_value(request, "x-user-email", "x-email", "email", "ops@drainpulse.local")
    return create_demo_session(
        email=fallback_email,
        role=fallback_role,
        tenant_id=fallback_tenant,
    )


def require_role(*allowed_roles: str):
    allowed = {_normalize_role(role) for role in allowed_roles}

    def dependency(request: Request) -> dict[str, str]:
        context = get_request_context(request)
        role = _normalize_role(context["role"])
        if role not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(sorted(allowed))}",
            )
        return context

    return dependency


def assert_tenant_access(request: Request, tenant_id: str | None, *, allow_admin: bool = True) -> str:
    context = get_request_context(request)
    current_tenant = _normalize_tenant_id(context.get("tenant_id"))
    role = _normalize_role(context.get("role"))

    if allow_admin and role == "admin":
        return current_tenant
    if tenant_id is None:
        return current_tenant
    normalized_target = _normalize_tenant_id(tenant_id)
    if current_tenant != normalized_target:
        raise HTTPException(status_code=403, detail="Access denied for this tenant context")
    return current_tenant


def get_tenant_id(request: Request) -> str:
    return _normalize_tenant_id(get_request_context(request)["tenant_id"])


def tenant_allowed_for_role(tenant_id: str, role: str) -> bool:
    if _normalize_role(role) == "admin":
        return True
    return bool(_normalize_tenant_id(tenant_id))


def apply_tenant_filter(request: Request, query, model):
    context = get_request_context(request)
    tenant_id = _normalize_tenant_id(context["tenant_id"])
    role = _normalize_role(context["role"])

    if role == "admin":
        return query

    if hasattr(model, "tenant_id"):
        return query.filter(model.tenant_id == tenant_id)

    return query
