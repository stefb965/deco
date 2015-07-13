# Building Distribution Packages

### Mac OS X
Compile with `grunt compile`, and create a pretty DMG image. Once done, ensure to add the GNU GPL to the DMG by using `licenseDMG.py`. Execute the following command on OS X with Xcode and Rez tools installed:

```
python ./postcompile/osx/licenseDMG.py {path_to_dmg} ./LICENSE
```