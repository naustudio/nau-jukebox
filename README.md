NAU JUKEBOX
===========
This is a fun, side project to allow our team to collectively suggest and play a continuously pending list of songs.

The songs URL is currently parsable from nhaccuatui.com, mp3.zing.com, soundcloud.com, youtube.com

**NOTE: This code is under major migration to support OAuth login and multi-room. Stay tuned.** 


Changelog:
----------

### 2017-09-18
- Re-organize code to separate client/server folders
- Upgrade code to ES6
- Upgrade MediaElementPlayer to 4.2.5 to fix several auto-continuation issues
- Fix booking of Zing source URLs
- Changes of labels and icons to more understandable UI

### 2017-09-12
- Upgrade to Meteor 1.5.1
- Move to use Meteor built-in Accounts collection
- Implement OAuth login with Facebook and Google
- Change logo and text labels
- Tweak search results

### Release 2016-08-21
- Refactor parsers to use new ES6 module format
- Completely refactor the player to allow to play more type of source
- Implement Youtube parser and player (using MediaElementJS wrapper with YouTube iFrame player API)

### Release 2016-08-14
- Upgrade to Meteor 1.4.0.1 with support for Node 4 & MongoDB 3
- New lyrics display (for NCT & Zing only)

### Release 2016-07-19
- New experiment __NauCoin__ feature

### Release 2016-07-15
- New __SoundCloud__ URL support
- Make `nickname` compulsory field to book songs
- New __host (admin)__ role (require login)
- Bug fixes

### Release 2016-06-20
- New __NauStorm__ section
- New dynamic header background

### Release 2016-05-22
- Upgrade to Meteor 1.3.2.4
- Many bug fixes

### Release 2016-05-03
- UI refresh
- New nickname input to store the person who book the songs
- New keyboard shortcuts to focus on the input field
- New tab lists to show song book from different periods
- Input box is now also a search box to quickly search and rebook existing songs

Colophon:
---------
- Meteor JS - http://meteor.com
- MediaElementJS - http://mediaelementjs.com/
- Other Meteor packages: see .meteor/packages

---
© 2017 Nâu Studio and contributors. Licensed under MIT license.
