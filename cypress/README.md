# Cypress Tests

The FFG Star Wars Enhancements module uses [Cypress](https://www.cypress.io/) to run its tests.

## Overview

Cypress automates front end testing by emulating user interactions within a browser.

## Testing locally

> :warning: Cypress tests run against FoundryVTT's default port of 30001 by default. The tests take actions that may be harmful to any real games running in that environment. See Configuration below to change the default.

Cypress itself does not orchestrate launching FoundryVTT. By default, it expects a fresh FoundryVTT instance to be running on `http://localhost:30001`.

To run Cypress [headless](https://en.wikipedia.org/wiki/Headless_browser) from the commandline:

```shell
# Install dependencies
npm install

# Run Cypress
npx cypress run
```

## Testing locally

Running Cypress in its interactive mode can simplify troubleshooting or developing new tests.

There are a number of ways to [launch Cypress](https://docs.cypress.io/guides/getting-started/opening-the-app) interactively.
(Note: When testing interactively, keep the window in focus or use Chrome devtools to emulate a focused page. See [#158](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/158).)

If you're developing in the same environment as the code base with no virtualization/container layers, try `npx cypress open`.
Otherwise, [install Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress) manually.

Once Cypress is open:

1. Add the project
2. Select "E2E Testing"
3. Select "Start E2E Testing in Chrome" (or the browser of your choice), which launches the browser
4. Select the test to run (`*.cy.js` file) - :warning: the test is immediately run

### Configuration

The default Cypress configuration can be customized by creating a `cypress.env.json` in the project root. For example, to change the instance of FoundryVTT being tested to another port, populate the file with:

```json
{
    "baseUrl": "http://localhost:8080"
}
```

### Docker Compose

To test FoundryVTT with Docker, use the `felddy/foundryvtt` docker image. This is what our GitHub Actions use.
To make this simpler, a `docker-compose.yaml` has been included in the root of this repository. It can be used to setup/tear-down FoundryVTT for quick testing.

```shell

# Copy the secrets distribution file and populate it with your foundryvtt.com credentials and license key
cp secrets.json.dist secrets.json

# Launch FoundryVTT
docker compose up -d

# Attach to monitor logs; detach with ctrl-p ctrl-q
docker attach foundryvtt

# Teardown FoundryVTT
docker compose down
```

To override the `docker-compose.yaml` defaults create a [docker-compose.override.yaml](https://docs.docker.com/compose/extends/).

```yaml
services:
    foundry-test:
        # See https://github.com/felddy/foundryvtt-docker for other environment variables
        environment:
            # Change the UID/GID to match your development environment to avoid FoundryVTT overwriting permissions
            - FOUNDRY_UID=1000
            - FOUNDRY_GID=1000

        # Remind port mapping
        ports:
            - target: 30000
              published: 8080
              protocol: tcp
```

## Configuring Github Actions

> :warning: The Github Actions use [pull_request_target](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/) and have been carefully configured to protect the FoundryVTT credentials by requiring approval from untrusted forks prior to running tests. If emulating this repository, be very careful.

The Cypress tests are configured to run on pull requests (see `.github/workflows/cypress.yaml`). For PRs from a branch within the repository, they're automatically run. For PRs from a fork, each run must be approved by a contributor (this is to protect the FoundryVTT credentials). Unfortunately, both jobs show up on all PRs, but only one is run per PR.

The repository requires some manual configuration. Follow these steps:

### 1. Actions secrets and variables

Configure the FoundryVTT user credentials and license key to launch FoundryVTT.

1. Navigate to the repository > Settings > Secrets and variables > Actions
2. Repeat following for `FOUNDRY_LICENSE_KEY`, `FOUNDRY_PASSWORD`, and `FOUNDRY_USERNAME`:
    1. Click "New repository secret"
    2. Populate the secret name and its value
    3. Click "Add secret"

### 2. Environment

Configure the `requires-approval` environment to require specific approvers to run the Cypress tests from a fork.

1. Navigate to the repository > Settings > Environments
2. Click "New environment"
3. Name it exactly `requires-approval` and click "Configure environment"
4. Check "Requires reviewers" and specify who is allowed to approve
5. Click "Save protection rules"

Note: No environment variables need to be configured here. They're inherited from the repository global variables.

### 3. Actions permissions (Optional)

Review the repository Actions permissions. The defaults are sensible, but these settings provide optional hardening configuration.

1. Navigate to the repository > Settings > Actions > General
2. Review all settings, specifically "Fork pull request workflows from outside collaborators"
   (this is separate to our `requires-approval` environment)
3. Consider hardening "Workflow permissions"
