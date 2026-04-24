#!/usr/bin/env bash

# Sync the wiki folder with the GitHub wiki remote
echo "Pushing wiki changes to GitHub..."
git subtree push --prefix wiki wiki master
echo "Done!"
