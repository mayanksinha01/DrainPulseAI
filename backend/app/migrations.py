from __future__ import annotations

from pathlib import Path

from sqlalchemy import text

from app.database import SessionLocal

MIGRATION_DIR = Path(__file__).resolve().parent.parent / "migrations"


def run_migrations() -> None:
    if not MIGRATION_DIR.exists():
        return

    files = sorted(MIGRATION_DIR.glob("*.sql"))
    if not files:
        return

    with SessionLocal() as db:
        for migration_file in files:
            sql = migration_file.read_text(encoding="utf-8")
            for statement in [section.strip() for section in sql.split(";") if section.strip()]:
                db.execute(text(statement))
        db.commit()
