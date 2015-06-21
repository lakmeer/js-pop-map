
# Require

{ id, log, keys } = require \std


# Program index

log "POP MAP"


# Create assets lib


# Create mock level layout

level-data = require \./mock-level-data

{ Assets }   = require \./assets
{ Renderer } = require \./renderer
{ Camera }   = require \./camera
{ PopLevel } = require \./level


# Load a PLV file

xhr = new XMLHttpRequest
xhr.open \GET, "levels/01.plv", true
xhr.response-type = \arraybuffer
xhr.onload = -> new PopLevel @response
xhr.send!


# Draw some assets

canvas = document.create-element \canvas
ctx = canvas.get-context \2d









# Navigate rooms my keys


# Minimap


# Pan with mouse drag


# Load other levels


