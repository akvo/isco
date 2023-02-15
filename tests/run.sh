#!/usr/bin/env sh

sleep 5

selenium-side-runner -s http://localhost:4444 --output-directory ./out ./sides/*.side
