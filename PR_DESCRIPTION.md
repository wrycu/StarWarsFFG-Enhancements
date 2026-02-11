# Fix Actors deprecation warning for FoundryVTT v13+

Hey! Fixed that annoying deprecation warning that was popping up in the console. The shop sheet was using the old global `Actors` API which FoundryVTT is moving away from.

## What changed

- Updated `Actors.registerSheet()` to use `foundry.documents.collections.Actors.registerSheet()` in the shop sheet
- This makes it compatible with FoundryVTT v13+ and should keep working through v15 when the old API gets removed
- No more console warnings! 🎉

The fix is pretty straightforward - just swapped out the deprecated global for the new namespaced version. Everything should work exactly the same, just without the deprecation noise.

Thanks to `DukeVenator` for reporting this!

