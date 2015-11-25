#!/bin/sh

#
# From: https://gist.github.com/brugnara/80f980e4e33da7b87408
# Daniele Brugnara
# Updated by Thanh Tran for Meteor 1.2, added --excludeCollection=system.users to mongodump command
#
# usage:
# meteor mongo xyz.meteor.com --url | ./do.sh
#

read mongo_auth

db_name=`echo $mongo_auth | awk '{split($0,array,"/")} END{print array[4]}'`
ar=`echo $mongo_auth | tr '//' '\n' | grep client | tr ':' '\n' | head -n 2 | tr '@' '\n' | tr '\n' ':'`

username=`echo $ar | awk '{split($0,array,":")} END{print array[1]}'`
password=`echo $ar | awk '{split($0,array,":")} END{print array[2]}'`
host=`echo $ar | awk '{split($0,array,":")} END{print array[3]}'`

echo $host
echo $username
echo $password
echo $db_name

mongodump -h $host --port 27017 --username $username --password $password -d $db_name --excludeCollection=system.users