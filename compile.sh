#!/usr/bin/sh
npx vite build && scp -r dist/* parcel@172.20.136.11:/var/www/html
