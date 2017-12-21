#!/bin/sh

#
# @author Thanh Tran
#
# @usage:
# Extract archived mongodump zip
# Start local meteor app first then execute:
#
# ./mongorestore.sh ./private/jukebox/
#

mongorestore -h localhost --port 3001 --db meteor --drop "$1"
