# Nau Jukebox Changelog

## 2019-01-15

* Update youtube parser for 2019 HTML content

## 2018-02-27

* Attempt to fix Goalify login issues
* Fix an issue with My Bookings load more

## 2018-02-24

* NEW: My bookings history tab
* NEW: Add [Goalify.plus](http://goalify.plus) app OAuth login
* Update Zing parser to keep multiple artist names
* Use Youtube video thumbnail instead of uploader's
* Bug and stability fixes

## 2018-01-08

* (Backend) Record room's created date
* Additionally hightlight currently playing song
* FAQ & documentation updates
* Bug fixes

## 2017-12-29

* **(BIG CHANGE)** Multi rooms feature
* New mobile-friendly UI
* New landing page with info and room creation
* Search pattern for existing songs enhancement
* Users list enhancement
* Many bug fixes

## 2017-12-26

* **(BIG CHANGE)** Migrate Client side to React and Flux architecture
* Optimize synced songs to client (play list now sync much faster)
* Search logic moved to server
* Mark bad songs if re-book with now-invalid URL
* Host indicator
* New Naucoin editing UI, row by row, instead of a dropdown

## 2017-11-08

* Upgrade to Meteor 1.6
* Fix NCT & Zing URL parsers
* Finally add license notice

## 2017-09-18

* Re-organize code to separate client/server folders
* Upgrade code to ES6
* Upgrade MediaElementPlayer to 4.2.5 to fix several auto-continuation issues
* Fix booking of Zing source URLs
* Changes of labels and icons to more understandable UI

## 2017-09-12

* Upgrade to Meteor 1.5.1
* Move to use Meteor built-in Accounts collection
* Implement OAuth login with Facebook and Google
* Change logo and text labels
* Tweak search results

## Release 2016-08-21

* Refactor parsers to use new ES6 module format
* Completely refactor the player to allow to play more type of source
* Implement Youtube parser and player (using MediaElementJS wrapper with YouTube iFrame player API)

## Release 2016-08-14

* Upgrade to Meteor 1.4.0.1 with support for Node 4 & MongoDB 3
* New lyrics display (for NCT & Zing only)

## Release 2016-07-19

* New experiment **NauCoin** feature

## Release 2016-07-15

* New **SoundCloud** URL support
* Make `nickname` compulsory field to book songs
* New **host (admin)** role (require login)
* Bug fixes

## Release 2016-06-20

* New **NauStorm** section
* New dynamic header background

## Release 2016-05-22

* Upgrade to Meteor 1.3.2.4
* Many bug fixes

## Release 2016-05-03

* UI refresh
* New nickname input to store the person who book the songs
* New keyboard shortcuts to focus on the input field
* New tab lists to show song book from different periods
* Input box is now also a search box to quickly search and rebook existing songs
