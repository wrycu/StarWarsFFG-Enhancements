`3.0.0` - ?
- FIX: Opening crawl now works with Foundry VTT v13 (thanks `@dukevenator`!)
  - Migrated to ApplicationV2
  - Updated audio preloading
- FIX: Various shop fixes & enhancements ([#196](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/196))
  - Fixes
    - Correct shop table width
    - Correct shop table height
    - Correct GM-only label of "buy item" to correctly show "delete item"
  - Enhancements
    - Shops can now keep inventory when regenerating
    - Add label to regenerate inventory button
    - Show GM stock item price (MSRP)
    - Added GM functionality to show shop to players (they must have access to the actor)
    - Add the ability to require the presence or absense of item tags when generating shop inventory
    - Add minimum and maximum price limits

`2.1.2` - 2025-06-15

-  FIX: Default compendiums for the shop cannot be found ([#213](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/213))
-  FIX: Update Spanish translation (thanks `@mcalduch`!)

`2.1.1` - 2024-06-15

-   IMPROVEMENT: Various title card improvements ([#203](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/203)) (thanks `KamiliaBlow!`)
    -   Font color can now be configured
    -   Text zoom amount and speed can now be configured
    -   You can now use 2 lines of text for the logo, instead of an image
-   FIX: Status Icons now work again ([#200](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/200))
-   FIX: Attack animations by items should stop being wacky when adding/removing entries ([#206](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/206))

`2.1.0` - 2024-05-26

-   COMPATABILITY: Module updated to work with FoundryVTT v12
-   NEW FEATURE: You can specify compendiums from which shops will auto-build inventories
-   NEW FEATURE: Attack animations can now be specified by item name
    -   For example, you can set custom animations for `*disrupter*` to change the behavior of all disruptor weapons on any actor
-   FIX: Correct Bounty CSS datapad breaking after editing
-   FIX: Attack animations are now properly aligned when the system is set to any language other than English

`2.0.6` - 2024-04-06

-   NEW FEATURE: Configurable Book of Boba Fett-style title cards can be played like the opening crawl (thanks `grafeisen`!)
-   IMPROVEMENT: Opening crawl timing can be configured in the settings (thanks `grafeisen`!
-   FIX: Module settings popup windows titles corrected
-   NEW FEATURE: Attack animations now take into account if the attack hit or not. Have fun watching blaster bolts go
    everywhere but your target!
-   NOTE: The generic slots feature now defaults to OFF as the system implements it natively (and better)

`2.0.5` - 2023-12-29

-   FIX: Minion group size should once again
    display ([#164](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/164))
-   IMPROVEMENT: Add large datapad (thanks `Spocky69`!)

`2.0.4` - 2023-10-09

-   Add Brazilian translation (thanks `neour#4842`!)
-   FIX: Correct Melee animation looking squished ([#102](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/102)) (
    thanks `tim-bersau` for reporting and `SourTarte` for providing a fix!)
-   IMPROVEMENT: Combat actors can now have custom images
    set ([#168](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/168))
-   FIX: Now verified against all v10 ([#171](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/171))

`2.0.3` - 2023-03-01

-   FIX: Break fix release build missing test files causing an
    error ([#162](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/162))

`2.0.2` - 2023-02-28

-   FIX: Fix for opening crawl improperly not including custom
    images ([#136](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/136))
-   FIX: Multiple fixes with attack animations not playing
    correctly ([#129](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/129), [#124](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/124))
-   NOTE: We have begun to add both integration and end-to-end tests. Hopefully, this leads to fewer regressions going
    forward.

`2.0.1` - 2023-02-12

-   FIX: Correct Dice Helper not working for Ranged
    Attacks ([#120](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/120))
-   FIX: Fix opening-crawl by removing wrapper p tag from template and parsing
    logic ([#136](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/136))

`2.0.0` - 2023-02-01

-   NEW FEATURE: stable Foundry v10 support
-   FIX: Alpha bug - Per-item attack animations now work again
-   REMOVED: Vehicle roller has been removed. Better support has been added in the system natively

`2.0.0alpha-1` - 2023-01-06

-   NEW FEATURE: alpha Foundry v10 support

`1.0.0` - 2022-06-05

-   IMPROVEMENT: Dice helper will now work with translations. English and French have been provided. (thanks for
    implementing it, `ercete#4836`!)
-   IMPROVEMENT: Minion quantity status icon refers now to 'actual' minion quantity instead of 'maximum' (thanks for
    implementing it, `ercete#4836`!)
-   Fixed double menu entry for 'Stimpack syncing status icon', the config menu as migrated in 'Talent Checker' submenu (
    thanks for implementing it, `ercete#4836`!)
-   New default status icons for Stimpacks, Minions and Minions at zero (thanks for implementing it, `ercete#4836`!)
-   Update French translation (thanks `ercete#4836`!)

`0.2.10` - 2022-04-25

-   Fix for scene buttons being removed ([#114](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/114))

`0.2.9` - 2022-04-24

-   NEW FEATURE: Convert tokens to Holograms! (thanks `Solos#0001` for the idea and code)
-   Fix for shop not including item attachments
-   Fix for vehicle roller failing under certain
    conditions ([#112](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/112))
-   Fix for dependencies requiring old versions ([#111](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/111))

`0.2.8` - 2022-02-13

-   NEW FEATURE: Add Stimpack tracking - auto-applies a status when healing items are used
-   IMPROVEMENT: Attack animation now allows specifying the number of times to play the animation on a per-item
    basis ([#103](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/103))
-   Fix for attack animations not working when crews are enabled (
    thanks `Szyna1988`!) ([#97](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/97))
-   Fix for module being available for non-SW worlds (
    thanks `esheyw`!) ([#99](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/99))
-   Fix for only one status being auto-applied when multiple are applicable (e.g. minion group + `Adversary` talent)

`0.2.7` - 2022-01-23

-   Fix for non-numeric rolls not working on Foundry v9

`0.2.6` - 2022-01-18

-   Partial fix for intro crawl ends before end of
    text ([#71](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/71))
-   Fix for foundry slowdown when included scenes are
    imported ([#92](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/92))
-   Fix for vehicle roller breaking on Foundry v9 (
    thanks `ProfessorKiz`!) ([#96](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/96))
-   Remove Mandar theme fix now that the theme has been updated

`0.2.5` - 2022-01-16

-   Bug fixes for Foundry v9 - see the [milestone](https://github.com/wrycu/StarWarsFFG-Enhancements/milestone/3?closed=1)
    for details

`0.2.4` - 2021-12-28

-   Fix for vehicle roller breaking empty roller (thanks `Dexcellence`!)

`0.2.3` - 2021-12-23

-   NEW FEATURE: Add ability to show minion group (max) size
-   NEW FEATURE: Add ability to use actor dice pool with vehicle weapon
    rolls ([#76](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/76))
-   NEW FEATURE: Hyperspace transitions! ([#12](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/12))
-   Fix for shop item finding pool being built incorrectly
-   Fix for non-working adversary status to apply
-   Fix for skills with special characters in the name (
    thanks `Theik`!) ([#80](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/80))
-   Fix for player being unable to spend dice results ([#81](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/81))
-   Improve attack animation: players no longer need to select their own token to play attack animations (if they only
    have one token on the canvas) ([#77](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/77))
-   Improve description of combat renamer in settings window

`0.2.2` - 2021-11-05

-   Fix for relative URLs (thanks `anthonyscorrea`!) ([#68](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/68))
-   Fix for actor renaming resetting on reload (thanks `@Bolts#9418`!)
-   Fix for inability to roll items added to sheets after enabling the
    module ([#72](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/72))
-   Fix for inability to select intro crawl music via
    GUI ([#73](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/73))

`0.2.1` - 2021-09-05

-   Fix for breaking `fxmaster` scene controls ([#60](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/60))
-   Fix for Intro Crawl audio delay not working ([#63](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/63))
-   Fix for dice result spender not working on non-item rolls... again (
    thanks `@Theik`!) ([#65](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/65))
-   Add triumph and despair in place of advantage and threat support for dice result spender (
    thanks `@Theik`!) ([#66](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/66))
-   Improve intro crawl text tilt ([#54](https://github.com/wrycu/StarWarsFFG-Enhancements/pull/54))
-   Add attack animation settings for grenades ([#46](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/46))

`0.2.0` - 2021-07-18

-   Support for Foundry `0.8.x` ([#52](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/52))
    -   All Foundry `0.9.x` warnings have been addressed; the move to that version should be faster
-   Shop improvements: shop settings are now
    remembered ([#56](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/56))
-   Allow players to use dice result spender ([#51](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/51))
-   Fix for dice result spender generating new buttons when scrolling through chat history

`0.1.11` - 2021-06-29

-   Fix for missing localizations ([#50](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/50))
    -   Thanks `@Belgarath` for translating to French and pointing out missing localizations
-   Fix for rolls of combat skills not from an item not working
    properly ([#48](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/48))
-   Add attack animation reset button ([#45](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/45))

`0.1.10` - 2021-05-30

-   Add count for Adversary status ([#40](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/40))
-   Intro crawl improvements ([#24](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/24))
    -   Add a setting for delay of music playback
    -   Add settings for moving the image left/right and up/down
    -   Add setting for font size
    -   Move settings into a sub-menu
-   Allow the removal of custom attack animations per
    item ([#39](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/39))
-   Fix for incomplete localization of dice spender (thanks `@prolice`!)
-   Add French localization (thanks `@prolice`!)
    -   Note that I don't speak French and this will require the community to be kept up-to-date
-   Fix for attack animation breaking rolling from skill (@thanks `@prolice!`)
-   Fix for default attack animations when jb2a_patreon is
    loaded ([#42](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/42))
-   Add support for non-combat dice result spending ([#25](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/25))

`0.1.9` - 2021-05-23

-   Fix for attack animation breaking rolling all dice except in my test instance :0

`0.1.8` - 2021-05-23

-   Added the ability to set attack animations per
    item ([#31](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/31))
-   Improve dependency management for JB2A Patreon
    module ([#27](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/27))
-   Fix for attack animations only working on English
    version ([#34](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/34))
-   Fix for dice helper only working on English
    version ([#34](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/34))
-   Fix for shop generator button not being localized ([#36](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/36))
-   Fix for `Mandar` theme mucking up actor sheet
    names ([#37](https://github.com/wrycu/StarWarsFFG-Enhancements/issues/37))

`0.1.7` - 2021-05-18

-   Initial alpha release
-   Planned features:
    -   Configurable, open source Hyperspace transition
