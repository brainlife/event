#!/bin/bash

docker-compose exec auth /apps/auth/bin/auth.js \
    issue \
    --scopes '{ "sca": ["user", "admin"] }' \
    --sub 'sca' \
    --out /apps/event/api/config/sca.jwt
