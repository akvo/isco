#!/usr/bin/env bash

sleep 5

selenium-side-runner -s http://firefox:4444 --output-directory /root/out /sides/*.side
