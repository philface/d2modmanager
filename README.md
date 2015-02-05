# d2modmanager
dota 2 mod manager without vpk injection

Here is a video showing installation and usage: http://a.pomf.se/ossjdv.webm

### !! *enable_addons* should still be in your launch options, or ability icons might not get changed !!

# Installation
1. Make a backup copy of gameinfo.txt in *YourSteampath\Dota 2 beta\dota*

2. Download d2modmanager, extract the folders "dota", "modmanager" and "custom" to *YourSteampath\Dota 2 beta*

It should ask you to override gameinfo.txt (remember the backup). Confirm.

3. You need Node.JS installed ( http://nodejs.org/ )

4. Open a CMD prompt in *YourSteampath\Dota 2 beta\modmanager*

5. type "npm install" to install the needed libraries

6. d2modmanager should now be working, type "mm list" to test if errors appear

# Installing Mods
Your mod needs to be in the following format:
a folder (preferably named lowercase and without spaces) containing the mod files.
For example saber\particles (models, materials etc.)

You can add a mod by typing "mm C:\whatever\saber" Or by just dragging the folder on the mm.bat file.

(If the drag & drop method is not working, copy the folder in the modmanager folder and try again. You can delete it after it was successfully added.

If the installation succeeds the tool you can enter some information about the mod.

Afterwards it should be visible in "mm list". You can now enable it with "mm enable <modname>"

The commands are listed under "mm --help" or by just starting "mm" without arguments.
mm enable <modname>
mm disable <modname>
mm list
mm remove <modname>
mm build


# Building

After you installed your mods and enabled/disabled those you want to use, you can use "mm build" to create the vpk file.
You have to do this after every change in your enable/disable list so the vpk file can get updated.



# Deactivate
If you want to temporarily play without mods, just change gameinfo.txt back to the old one.
