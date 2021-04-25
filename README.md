# StarWarsFFG_Enhancements
Module intended to provide minor enhancements for the [StarWarsFFG FoundryVTT system](https://github.com/StarWarsFoundryVTT/StarWarsFFG) without including any copyrighted content.

## Scope

This module is designed to supplement the
[StarWarsFFG FoundryVTT system](https://github.com/StarWarsFoundryVTT/StarWarsFFG).  The enhancements included are aimed at providing sane defaults for common workflows which aren't technically part of the core rules, such as: intro crawls, datapads, hyperspace transitions, and attack animations.  

**Note**: We do not aim to include any core-rule features. If it's something the FFG Star Wars system defines in rules, we believe the system module should support it.  This module is about enhancing the play experience, not implementing the rules.

## Enhancements
### Features
* Launch a customizable Opening Crawl based upon the [Kassel Labs Star Wars Intro Creator](https://github.com/KasselLabs/StarWarsIntroCreator)
* Easily create Bounties and Datapada entries for showing players
* Provides support for automatic, configurable attack animations (with sounds!)
* Automatically renames actors in combat (to generic "PC" and "NPC" slots)
* Provides tips on how to spend combat dice results
* AUtomatically adds a status to tokens which have the `Adversary` talent

### Utilities
* Includes Star Wars-like fonts
* Includes the most common macros from the Wiki

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

### What about copyright?
Creating a module like this is tricky - there's a fine line between helpful tweaks and straight-up including copyrighted assets. As such:
* We specifically exclude any content to which we do not have rights
* We provide licensing information for all third party assets we include

## Installation
Installing the Dev branch (the only version currently available) requires using the manifest file from `module-dev.json`.  At the time of writing, this means you should install with a URL of `https://raw.githubusercontent.com/wrycu/StarWarsFFG-Enhancements/dev/module-dev.json`.
