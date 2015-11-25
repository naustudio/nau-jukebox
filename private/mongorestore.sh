#!/bin/sh

#
#
# @author Thanh Tran
# for Meteor 1.2
#
# Based on mongodump script by Daniele Brugnara
#
# usage:
# meteor mongo xyz.meteor.com --url | ./mongorestore.sh path_to_dumped_db
#

read mongo_auth

db_name=`echo $mongo_auth | awk '{split($0,array,"/")} END{print array[4]}'`
ar=`echo $mongo_auth | tr '//' '\n' | grep client | tr ':' '\n' | head -n 2 | tr '@' '\n' | tr '\n' ':'`

username=`echo $ar | awk '{split($0,array,":")} END{print array[1]}'`
password=`echo $ar | awk '{split($0,array,":")} END{print array[2]}'`
host=`echo $ar | awk '{split($0,array,":")} END{print array[3]}'`

echo "Host: $host"
echo "User: $username"
echo "Pass: $password"
echo "DB: $db_name"
echo "Path: $1"

mongorestore -h $host --port 27017 --username $username --password $password -d $db_name --drop "$1"
