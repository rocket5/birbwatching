#!/usr/bin/env bash

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git checkout -b main
git add -A
git commit -m 'Deploy to GitHub Pages'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:Rocket5/birbwatching.git main:gh-pages

cd - 