.PHONY: install dev build preview typecheck setup

# ── Dependencies ──────────────────────────────────────────
install:
	npm install

# ── Development ───────────────────────────────────────────
dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

typecheck:
	npx tsc --noEmit

# ── Shortcuts ─────────────────────────────────────────────
setup: install  ## Full setup from scratch
	@echo "\n✔ Frontend ready. Run 'make dev' to start."
