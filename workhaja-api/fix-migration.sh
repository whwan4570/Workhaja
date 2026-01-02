#!/bin/sh
# Fix failed migration by marking it as rolled back
npx prisma migrate resolve --rolled-back 20260102000000_add_store_location_and_special_code || true
# Run migrations
npx prisma migrate deploy

