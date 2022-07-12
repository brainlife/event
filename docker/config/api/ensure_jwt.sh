#!/bin/bash

if [ ! -f /apps/event/api/config/sca.jwt ]; then
    /apps/event/bin/sca.js \
        issue \
        --scopes '{ "sca": ["user", "admin"] }' \
        --sub 'sca' \
        --out /apps/event/api/config/sca.jwt
fi
