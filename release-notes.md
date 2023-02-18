`2.0.1` - 2023-02-12

-   FIX: Correct Dice Helper not working for Ranged Attacks ([#120](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/120))
-   FIX: Fix opening-crawl by removing wrapper p tag from template and parsing logic ([#136](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/136))

`2.0.0` - 2023-02-01

-   NEW FEATURE: stable Foundry v10 support
-   FIX: Alpha bug - Per-item attack animations now work again
-   REMOVED: Vehicle roller has been removed. Better support has been added in the system natively

`2.0.0alpha-1` - 2023-01-06

-   NEW FEATURE: alpha Foundry v10 support

`1.0.0` - 2022-06-05

-   IMPROVEMENT: Dice helper will now work with translations. English and French have been provided. (thanks for implementing it, `ercete#4836`!)
-   IMPROVEMENT: Minion quantity status icon refers now to 'actual' minion quantity instead of 'maximum' (thanks for implementing it, `ercete#4836`!)
-   Fixed double menu entry for 'Stimpack syncing status icon', the config menu as migrated in 'Talent Checker' submenu (thanks for implementing it, `ercete#4836`!)
-   New default status icons for Stimpacks, Minions and Minions at zero (thanks for implementing it, `ercete#4836`!)
-   Update French translation (thanks `ercete#4836`!)

`0.2.10` - 2022-04-25

-   Fix for scene buttons being removed ([#114](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/114))

`0.2.9` - 2022-04-24

-   NEW FEATURE: Convert tokens to Holograms! (thanks `Solos#0001` for the idea and code)
-   Fix for shop not including item attachments
-   Fix for vehicle roller failing under certain conditions ([#112](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/112))
-   Fix for dependencies requiring old versions ([#111](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/111))

`0.2.8` - 2022-02-13

-   NEW FEATURE: Add Stimpack tracking - auto-applies a status when healing items are used
-   IMPROVEMENT: Attack animation now allows specifying the number of times to play the animation on a per-item basis ([#103](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/103))
-   Fix for attack animations not working when crews are enabled (thanks `Szyna1988`!) ([#97](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/97))
-   Fix for module being available for non-SW worlds (thanks `esheyw`!) ([#99](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/99))
-   Fix for only one status being auto-applied when multiple are applicable (e.g. minion group + `Adversary` talent)

`0.2.7` - 2022-01-23

-   Fix for non-numeric rolls not working on Foundry v9

`0.2.6` - 2022-01-18

-   Partial fix for intro crawl ends before end of text ([#71](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/71))
-   Fix for foundry slowdown when included scenes are imported ([#92](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/92))
-   Fix for vehicle roller breaking on Foundry v9 (thanks `ProfessorKiz`!) ([#96](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/96))
-   Remove Mandar theme fix now that the theme has been updated

`0.2.5` - 2022-01-16

-   Bug fixes for Foundry v9 - see the [milestone](https://github.com/wrycu/StarWarsFFG-Enhancements/milestone/3?closed=1) for details

`0.2.4` - 2021-12-28

-   Fix for vehicle roller breaking empty roller (thanks `Dexcellence`!)

`0.2.3` - 2021-12-23

-   NEW FEATURE: Add ability to show minion group (max) size
-   NEW FEATURE: Add ability to use actor dice pool with vehicle weapon rolls ([#76](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/76))
-   NEW FEATURE: Hyperspace transitions! ([#12](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/12))
-   Fix for shop item finding pool being built incorrectly
-   Fix for non-working adversary status to apply
-   Fix for skills with special characters in the name (thanks `Theik`!) ([#80](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/80))
-   Fix for player being unable to spend dice results ([#81](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/81))
-   Improve attack animation: players no longer need to select their own token to play attack animations (if they only have one token on the canvas) ([#77](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/77))
-   Improve description of combat renamer in settings window

`0.2.2` - 2021-11-05

-   Fix for relative URLs (thanks `anthonyscorrea`!) ([#68](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/68))
-   Fix for actor renaming resetting on reload (thanks `@Bolts#9418`!)
-   Fix for inability to roll items added to sheets after enabling the module ([#72](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/72))
-   Fix for inability to select intro crawl music via GUI ([#73](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/73))

`0.2.1` - 2021-09-05

-   Fix for breaking `fxmaster` scene controls ([#60](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/60))
-   Fix for Intro Crawl audio delay not working ([#63](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/63))
-   Fix for dice result spender not working on non-item rolls... again (thanks `@Theik`!) ([#65](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/65))
-   Add triumph and despair in place of advantage and threat support for dice result spender (thanks `@Theik`!) ([#66](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/66))
-   Improve intro crawl text tilt ([#54](https://github.com/wrycu/StarWarsFFG-Enhancements/pull/54))
-   Add attack animation settings for grenades ([#46](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/46))

`0.2.0` - 2021-07-18

-   Support for Foundry `0.8.x` ([#52](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/52))
    -   All Foundry `0.9.x` warnings have been addressed; the move to that version should be faster
-   Shop improvements: shop settings are now remembered ([#56](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/56))
-   Allow players to use dice result spender ([#51](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/51))
-   Fix for dice result spender generating new buttons when scrolling through chat history

`0.1.11` - 2021-06-29

-   Fix for missing localizations ([#50](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/50))
    -   Thanks `@Belgarath` for translating to French and pointing out missing localizations
-   Fix for rolls of combat skills not from an item not working properly ([#48](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/48))
-   Add attack animation reset button ([#45](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/45))

`0.1.10` - 2021-05-30

-   Add count for Adversary status ([#40](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/40))
-   Intro crawl improvements ([#24](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/24))
    -   Add a setting for delay of music playback
    -   Add settings for moving the image left/right and up/down
    -   Add setting for font size
    -   Move settings into a sub-menu
-   Allow the removal of custom attack animations per item ([#39](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/39))
-   Fix for incomplete localization of dice spender (thanks `@prolice`!)
-   Add French localization (thanks `@prolice`!)
    -   Note that I don't speak French and this will require the community to be kept up-to-date
-   Fix for attack animation breaking rolling from skill (@thanks `@prolice!`)
-   Fix for default attack animations when jb2a_patreon is loaded ([#42](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/42))
-   Add support for non-combat dice result spending ([#25](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/25))

`0.1.9` - 2021-05-23

-   Fix for attack animation breaking rolling all dice except in my test instance :0

`0.1.8` - 2021-05-23

-   Added the ability to set attack animations per item ([#31](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/31))
-   Improve dependency management for JB2A Patreon module ([#27](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/27))
-   Fix for attack animations only working on English version ([#34](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/34))
-   Fix for dice helper only working on English version ([#34](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/34))
-   Fix for shop generator button not being localized ([#36](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/36))
-   Fix for `Mandar` theme mucking up actor sheet names ([#37](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/37))

`0.1.7` - 2021-05-18

-   Initial alpha release
-   Planned features:
    -   Configurable, open source Hyperspace transition
