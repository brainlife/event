#!/bin/bash

(
    #start the api
    cd /app
    pm2 start ./api/event.js --attach --watch
)
