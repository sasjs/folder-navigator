#!/usr/bin/env bash

# copy the build file to the SAS server where it can be %inc'd as part of an STP

rsync -avhe ssh sasjsbuild/sas9.sas --delete mihmed@sas.analytium.co.uk:/tmp

echo "Now run: %inc '/tmp/sas9.sas';"