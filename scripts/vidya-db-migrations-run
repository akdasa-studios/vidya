#!/bin/bash

# ---------------------------------------------------------------------------- #
#                                     Doc                                      #
# ---------------------------------------------------------------------------- #

echo "
# ---------------------------------------------- #
#                Apply Migrations                #
# ---------------------------------------------- #
"

# ---------------------------------------------------------------------------- #
#                                     Task                                     #
# ---------------------------------------------------------------------------- #

echo "Starting Postgres..."
sudo service postgresql start >> /dev/null

echo "Compiling migrations..."
rm -rf ./modules/services/database/dist
npx --workspace @vidya/database tsc

echo "Applying migrations..."
npx --workspace @vidya/database typeorm migration:run -d ./dist/main.js
