#!/bin/sh

dest="../../../www/res/dispatcher/core.js"

rollup -f iife src/disp.js > "$dest"
