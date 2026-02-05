# readmecraft

A lightweight CLI tool to generate clean, structured README files.

## Features
-
 Fast
-
 Lightweight
-
 No config
-
 Clean template

## Installation
```bash
npm i -g readmecraft
## Usage
```bash
# interactive
readmecraft

# specify output file
readmecraft --out README.md

# non-interactive
readmecraft --no-prompt --force

# Chinese template
readmecraft --zh

# use config + interactive (config provides defaults)
readmecraft --config readmecraft.json

# use config + non-interactive
readmecraft --config readmecraft.json --no-prompt --force


#Templates
• templates/en.md
• templates/zh.md
#License
MIT