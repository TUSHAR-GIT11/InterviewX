#!/bin/sh
cd /app
node_modules/.bin/prisma migrate deploy
node src/server.js
