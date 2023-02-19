# Tests

The FFG Star Wars Enhancements module uses [Quench](https://github.com/Ethaks/FVTT-Quench) for its unit and integration tests. For end-to-end tests, see [cypress](../cypress/README.md).

## Quench

In practice, FoundryVTT modules are tightly coupled with API provided objects like `game`.
There currently are no testing harnesses that provide FoundryVTT API
[Fakes](https://www.martinfowler.com/articles/mocksArentStubs.html).
Additionally, the API is under active development, making maintaining mocks within this project cumbersome during major version updates of FoundryVTT.
For that reason, this project opts for integration tests using Quench.

## Testing locally

To test locally:

1. Launch FoundryVTT with this module mounted at `$foundryData/Data/modules/ffg-star-wars-enhancements`
2. Install all system and module dependencies (see `module.json` in repository root)
3. Install the Quench module
4. Create a test world using the Star Wars FFG system
5. Launch and Join the world
6. Enable all modules under Game Settings > Manage Modules
7. Open Quench UI under Game Settings > Quench
8. Click Run

> :information_source: To simplify this setup, use Docker Compose and run the Cypress end-to-end tests which will result in a FoundryVTT instance with all required systems/modules and a test world. See [cypress](../cypress/README.md) for more details.

## Relationship to Cypress in CI

Quench is a FoundryVTT module that is loaded into the game along side the target module.
The target module exposes tests, and Quench provides a UI and API to run these tests.
To execute the tests, FoundryVTT itself needs to be running.

To support running tests within CI, we use Cypress to install and activate Quench.
Then, we run the module tests via Quench's API and report back the entire result via a single Cypress test.