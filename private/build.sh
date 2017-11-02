#!/bin/bash

# build to directory
meteor build --directory ~/meteor/jukebox/
# change dir to install npm
cd ~/meteor/jukebox/bundle/programs/server/

npm install

