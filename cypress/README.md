# Cypress Tests

The FFG Star Wars Enhancements module uses [Cypress](https://www.cypress.io/) to run its tests.

## Overview

Cypress automates front end testing by emulating user interactions within a browser.

## Testing locally

> :warning: Cypress tests run against FoundryVTT's default port of 30000 by default. The tests take actions that may be harmful to any real games running in that environment. See Configuration below to change the default.

Cypress itself does not orchestrate launching FoundryVTT. By default, it expects a fresh FoundryVTT instance to be running on `http://localhost:30000`.

To run Cypress [headless](https://en.wikipedia.org/wiki/Headless_browser) from the commandline:

```shell
# Install dependencies
npm install

# Run Cypress
npx cypress run
```

## Developing locally

Running Cypress in its interactive mode can simplify troubleshooting or developing new tests.

There are a number of ways to [launching Cypress](https://docs.cypress.io/guides/getting-started/opening-the-app) interactively.
If you're developing in the same environment as the code base with no virtualization/container layers, try `npx cypress open`.
Otherwise, [install Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress) manually.

Once Cypress is open:

1. Add the project
2. Select "E2E Testing"
3. Select "Start E2E Testing in Chrome" (or the browser of your choice), which launches the browser
4. Select the test to run (`*.cy.js` file) - :warning: the test is immediately run

### Configuration

The default Cypress configuration can be customized with a `cypress.env.json`. For example, to change the instance of FoundryVTT being tested to another port:

```json
{
  "baseUrl": "http://localhost:30001"
}
```

### Docker Compose

To test FoundryVTT with Docker, use the `felddy/foundryvtt` docker image. This is what our GitHub Actions use.

TODO: Add `docker-compose.yaml` example.

Use Docker Compose to ease the setup and tear-down of FoundryVTT for testing.

```shell
# Launch FoundryVTT
docker compose up -d

# Attach to monitor logs; detach with ctrl-p ctrl-q
docker attach foundryvtt

# Teardown FoundryVTT
docker compose down
```

## Configuring Github Actions

The Cypress tests are configured to run on pull requests. For PRs from a branch within the repository, they're automatically run. For PRs from a fork, each run must be approved by a contributor (this is to protect the FoundryVTT credentials). Unfortunately, both of jobs show up on all PRs, but only one is run per PR.

To configure the repository:

1. Configure "Actions secrets and variables"
2. Configure a `requires-approval` Environment
3. Review "Actions permissions" (Optional)

### 1. Actions secrets and variables

Configure the FoundryVTT user credentials and license key to launch FoundryVTT.

1. Navigate to the repository > Settings > Secrets and variables > Actions
2. Repeat following for `FOUNDRY_LICENSE_KEY`, `FOUNDRY_PASSWORD`, and `FOUNDRY_USERNAME`:
   1. Click "New repository secret"
   2. Populate the secret name and its value
   3. Click "Add secret"

### 2. Environment

Configure the `requires-approval` environment to require specific approvers to run the Cypress tests on a fork.

1. Navigate to the repository > Settings > Environments
2. Click "New environment"
3. Name it exactly `requires-approval` and click "Configure environment"
4. Check "Requires reviewers" and specify who is allowed to approve
5. Click "Save protection rules"

Note: No environment variables need to be configured here. They're inherited from the repository global variables.

### 3. Actions permissions (Optional)

Review the repository Actions permissions.

1. Navigate to the repository > Settings > Actions > General
2. Review all settings, specificcally "Fork pull request workflows from outside collaborators"
   (this is separate to our `requires-approval` environment)
3. Consider hardening "Workflow permissions"
