# GitHub Actions CI/CD Pipeline for Loumo API (Production)

This document explains each section of the GitHub Actions workflow file used to automatically build, test, and deploy the Loumo API to a production server. The workflow is written in YAML and is split into jobs that run in sequence.

---

## Workflow Trigger

```yml
on:
  push:
    branches:
      - main
```

**Explanation:**  
This workflow runs automatically whenever code is pushed to the `main` branch. This ensures that only changes merged into the main codebase will trigger a deployment.

---

## Lint Job

```yml
jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: npm ci
        working-directory: ./loumo-api
      - name: Run linter
        run: npm run lint
        working-directory: ./loumo-api
```

**Explanation:**

- **Purpose:** Checks the code for formatting and style issues (linting).
- **Steps:**
  - Checks out the code from GitHub.
  - Installs dependencies using `npm ci`.
  - Runs the linter to catch code style errors.

---

## Test Job

```yml
test:
  name: Run Tests
  runs-on: ubuntu-latest
  needs: lint
  steps:
    - uses: actions/checkout@v4
    - name: Install deps
      run: npm ci
      working-directory: ./loumo-api
    - name: Run tests
      run: npm test
      working-directory: ./loumo-api
```

**Explanation:**

- **Purpose:** Runs automated tests to ensure the code works as expected.
- **Dependency:** Only runs if the lint job passes.
- **Steps:**
  - Checks out the code.
  - Installs dependencies.
  - Runs the test suite.

---

## Build Job

```yml
build:
  name: Build API
  runs-on: ubuntu-latest
  needs: test
  steps:
    - uses: actions/checkout@v4
    - name: Install deps
      run: npm ci
      working-directory: ./loumo-api
    - name: Build project
      run: npm run build
      working-directory: ./loumo-api
```

**Explanation:**

- **Purpose:** Compiles or prepares the application for deployment.
- **Dependency:** Runs only if tests pass.
- **Steps:**
  - Checks out the code.
  - Installs dependencies.
  - Builds the project (e.g., compiles TypeScript or bundles files).

---

## Deploy Job

```yml
deploy:
  name: Deploy to VPS
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: Checkout repo
      uses: actions/checkout@v4
```

**Explanation:**

- **Purpose:** Deploys the built application to a remote server (VPS).
- **Dependency:** Runs only if the build is successful.
- **First Step:** Checks out the code again for deployment.

---

### SSH Setup

```yml
- name: Setup SSH
  uses: webfactory/ssh-agent@v0.9.0
  with:
    ssh-private-key: ${{ secrets.PROD_SSH_PRIVATE_KEY }}

- name: Add VPS to known_hosts
  run: |
    ssh-keyscan -H ${{ secrets.PROD_VPS_HOST }} >> ~/.ssh/known_hosts
```

**Explanation:**

- **Purpose:** Sets up a secure connection to the server.
- **Steps:**
  - Loads the SSH private key (stored securely in GitHub secrets).
  - Adds the server to the list of known hosts to avoid security warnings.

---

### Prepare Release Directory

```yml
- name: Create release folder on VPS
  run: |
    TIMESTAMP=$(date +"%Y%m%d-%H%M")
    echo "RELEASE_DIR=~/deployments/loumo-app/releases/$TIMESTAMP" >> $GITHUB_ENV
    echo "DEPLOY_TIME=$TIMESTAMP" >> $GITHUB_ENV
```

**Explanation:**

- **Purpose:** Prepares a unique folder on the server for this deployment, using the current date and time.
- **Result:** Each deployment gets its own directory, making rollbacks easier.

---

### Deploy to VPS

```yml
- name: Deploy to VPS
  run: |
    ssh ${{ secrets.PROD_VPS_USER }}@${{ secrets.PROD_VPS_HOST }} 'bash -s' << EOF
      # (Deployment script runs here)
    EOF
```

**Explanation:**

- **Purpose:** Connects to the server and runs a deployment script.
- **What the script does:**
  - Creates the release directory.
  - Clones the latest code into it.
  - Copies environment variables.
  - Removes any old Docker containers that might conflict.
  - Builds and starts the application using Docker Compose.
  - Checks if the app is running and healthy.
  - If healthy, updates the "current" symlink to point to this release.
  - If not healthy, rolls back to the previous release.

---

### Health Check and Rollback

**Inside the deployment script:**

- The script tries up to 10 times to check if the app is healthy by calling its `/health` endpoint.
- If the app is healthy, the deployment is marked as successful.
- If not, it tries to restore the previous working version.

---

### Final Confirmation

```yml
- name: Confirm remote session is done
  run: echo "🧠 SSH session completed cleanly"
```

**Explanation:**

- **Purpose:** Prints a message to confirm the deployment script finished without errors.

---

## Summary

- **Lint:** Checks code style.
- **Test:** Runs automated tests.
- **Build:** Prepares the app for deployment.
- **Deploy:** Sends the app to the server, starts it, and checks if it works. If not, it rolls back to the previous version.

This setup ensures that only code that passes all checks is deployed, and failed deployments are automatically rolled back for safety.
