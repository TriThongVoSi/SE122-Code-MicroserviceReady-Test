# Verify Before Merge

This repository now has a required CI workflow: `CI Gate` (`.github/workflows/ci-gate.yml`).
Use the same command groups locally before opening or merging a PR.

## Prerequisites

- Node.js 20.x + npm (for frontend)
- Java 23 + Maven wrapper (`./mvnw`) (for backend)
- MySQL 8 (required for backend integration and Flyway validation)

## Required Commands (Merge Gate)

Run from repo root.

### 1) Frontend required gate

```bash
cd agricultural-crop-management-frontend
npm ci
npm run typecheck
npm run lint
npm run test -- --run
npm run build
```

Notes:
- Firebase secrets are not required for gate.
- Use placeholder envs if needed (example):
  - `VITE_FIREBASE_API_KEY=ci-placeholder`
  - `VITE_FIREBASE_AUTH_DOMAIN=ci-placeholder.firebaseapp.com`
  - `VITE_FIREBASE_PROJECT_ID=ci-placeholder`
  - `VITE_FIREBASE_STORAGE_BUCKET=ci-placeholder.appspot.com`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000`
  - `VITE_FIREBASE_APP_ID=1:000000000000:web:ci-placeholder`
  - `VITE_FIREBASE_MEASUREMENT_ID=G-PLACEHOLDER`

### 2) Backend required gate

```bash
cd agricultural-crop-management-backend
./mvnw -q -DskipTests compile
./mvnw -q test
```

Recommended env for local MySQL-backed run:

```bash
DB_URL=jdbc:mysql://127.0.0.1:3306/quanlymuavu_ci?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USER=root
DB_PASS=root
JWT_SIGNER_KEY=ci_signer_key_please_rotate_if_reused
MAIL_ENABLED=false
APP_AI_API_KEY=
APP_AI_BASE_URL=https://example.invalid
```

### 3) Backend Flyway migration validation (required in CI)

```bash
cd agricultural-crop-management-backend
./mvnw -q -DskipTests org.flywaydb:flyway-maven-plugin:11.7.2:baseline \
  -Dflyway.url="jdbc:mysql://127.0.0.1:3306/quanlymuavu_ci" \
  -Dflyway.user=root \
  -Dflyway.password=root \
  -Dflyway.locations=filesystem:src/main/resources/db/migration \
  -Dflyway.schemas=quanlymuavu_ci \
  -Dflyway.baselineVersion=13

./mvnw -q -DskipTests org.flywaydb:flyway-maven-plugin:11.7.2:validate \
  -Dflyway.url="jdbc:mysql://127.0.0.1:3306/quanlymuavu_ci" \
  -Dflyway.user=root \
  -Dflyway.password=root \
  -Dflyway.locations=filesystem:src/main/resources/db/migration \
  -Dflyway.schemas=quanlymuavu_ci \
  -Dflyway.ignoreMigrationPatterns=*:pending
```

PowerShell note on Windows:
- If command parsing breaks for `-Dflyway.url=...`, use `./mvnw --% ...` to pass arguments literally.

## Optional Commands

- FDN-focused frontend contracts/flow:

```bash
cd agricultural-crop-management-frontend
npm run test:fdn
```

- FDN gate script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ci-fdn-gate.ps1
```

- Marketplace release gate (Quynh-owned scope):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/ci-marketplace-release-gate.ps1
```

## Scope Notes (Current Gate)

- Global Search is deferred and not added as a separate gate target in this phase.
- AI Assistant/Gemini enhancement is deferred and not added as a separate gate target in this phase.
- Existing compile/test coverage for those modules still runs if they are part of current project tests/builds.
