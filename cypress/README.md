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
