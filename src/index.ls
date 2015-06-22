
# Require

{ id, log, keys, random-from, delay, every } = require \std

{ Assets }   = require \./assets
{ PopLevel } = require \./level


#
# Program index
#

# Create assets lib
# Create mock level layout
# Load a PLV file

level-data = {}

xhr = new XMLHttpRequest
xhr.open \GET, "levels/01.plv", true
xhr.response-type = \arraybuffer
xhr.send!
xhr.onload = ->
  level-data := new PopLevel @response

  # Level grid size
  zx = 32
  zy = 63
  zz = 10

  # Draw some assets
  canvas = document.create-element \canvas
  canvas.width = 10 * zx
  canvas.height = 3 * zy + 2
  ctx = canvas.get-context \2d
  document.body.append-child canvas

  ctx.text-baseline = \middle
  ctx.text-align = \center
  ctx.font = "16px monospace"

  colors = <[ black black red darkcyan yellow green blue cyan purple pink
              white black red purple grey green blue cyan pink orange
              cyan black red orange yellow green blue cyan purple pink ]>

  load-img = (src) -> i = new Image; i.src = \/tiles/ + src + \.png; return i

  none       = {}
  wall       = load-img \wall
  torch      = load-img \torch
  floor      = load-img \floor
  pillar     = load-img \pillars
  debris     = load-img \debris
  unstable   = load-img \unstable
  gate       = load-img \gate
  plate      = load-img \plate
  red        = load-img \potion-red
  slam       = load-img \slam
  spikes     = load-img \spikes
  exit-left  = load-img \exit-left
  exit-right = load-img \exit-right
  skeleton   = load-img \skeleton
  sword      = load-img \sword

  get-room-offsets = ->
    switch it
    | \up    => { x: 0, y: zy * -3 }
    | \down  => { x: 0, y: zy *  3 }
    | \left  => { x: zx * -10, y: 0 }
    | \right => { x: zx *  10, y: 0 }

  draw-neighbour = (links, dir, ox, oy) ->
    if links[dir]
      { x, y } = get-room-offsets dir
      draw-room that, ox + x, oy + y

  draw-room-with-neighbours = (room, ox, oy) ->
    ctx.clear-rect 0, 0, 400, 400
    links = level-data.links[room]
    draw-neighbour links, \down, ox, oy
    draw-neighbour links, \left, ox, oy
    draw-room room, ox, oy
    draw-neighbour links, \right, ox, oy
    draw-neighbour links, \up, ox, oy

  draw-room = (room, ox, oy) ->
    log "Draw room:", room, "at", ox, oy
    tiles = level-data.rooms[room].foretiles
    draw-room-tiles tiles, ox, oy

  draw-room-tiles = (tile-rows, ox, oy) ->
    for row-ix from 2 to 0
      row = tile-rows[row-ix]
      for tile in row
        image = switch tile.name
        | "Empty"        => none
        | "Torch"        => torch
        | "Spikes"       => spikes
        | "Wall"         => wall
        | "Floor"        => floor
        | "Pillar"       => pillar
        | "Debris"       => debris
        | "Loose Board"  => unstable
        | "Gate"         => gate
        | "Potion"       => red
        | "Raise Button" => plate
        | "Drop Button"  => slam
        | "Exit Left"    => exit-left
        | "Exit Right"   => exit-right
        | "Skeleton"     => skeleton
        | "Sword"        => sword
        | otherwise      => null

        if image is none
          void
        else if image
          ctx.draw-image image, tile.x * zx + ox, tile.y * zy - zz + oy
        else
          ctx.fill-style = \white
          ctx.stroke-text tile.code.to-string(16), tile.x * zx + zx + ox, tile.y * zy + zy * 0.7 + oy
          ctx.fill-text   tile.code.to-string(16), tile.x * zx + zx + ox, tile.y * zy + zy * 0.7 + oy



  pan        = { x: 0, y: 0 }
  last-mouse = { x: 0, y: 0 }
  dragging   = off

  canvas.add-event-listener \mousedown, -> dragging := on
  canvas.add-event-listener \mouseup,   -> dragging := off

  canvas.add-event-listener \mousemove, (event) ->
    Δx = last-mouse.x - event.offset-x
    Δy = last-mouse.y - event.offset-y

    last-mouse.x = event.offset-x
    last-mouse.y = event.offset-y

    if dragging
      log \dragging

      pan.x -= Δx
      pan.y -= Δy

      draw-room-with-neighbours level-data.start.room, pan.x, pan.y

  delay 100, -> draw-room-with-neighbours level-data.start.room, pan.x, pan.y


# Navigate rooms my keys


# Minimap


# Pan with mouse drag


# Load other levels


# Begin


