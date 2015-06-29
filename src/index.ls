
# Require

{ id, log, keys, floor, random-from, delay, every, group-by, values, reverse } = require \std

{ Dungeon, Palace }  = require \./assets
{ Blitter }  = require \./blitter
{ PopLevel } = require \./level

{ tile-x, tile-y, tiles-per-room, room-width, room-height } = require \./config

#
# Program index
#

level-data = {}

xhr = new XMLHttpRequest
xhr.open \GET, "levels/04.plv", true
xhr.response-type = \arraybuffer
xhr.send!
xhr.onload = ->

  level-data  := new PopLevel @response, Palace
  main-blitter = new Blitter window.inner-width, window.inner-height

  # Draw some assets

  get-room-offsets = ->
    switch it
    | \up    => { x: 0, y: tile-y * -room-height }
    | \down  => { x: 0, y: tile-y *  room-height }
    | \left  => { x: tile-x * -room-width, y: 0 }
    | \right => { x: tile-x *  room-width, y: 0 }

  get-room-coords = (dir, { x, y }) ->
    switch dir
    | \up    => { x, y: y - 1 }
    | \down  => { x, y: y + 1 }
    | \left  => { x: x - 1, y }
    | \right => { x: x + 1, y }
    | otherwise => console.error 'What?'

  discover-room-positions = (room) ->
    coords = []
    coords[room] = { x: 0, y: 0 }

    fetch-unresolved = (room) ->
      links = level-data.links[room]
      for dir, index of links
        if not coords[index]
          coords[index] = get-room-coords dir, coords[room]
          fetch-unresolved index

    fetch-unresolved room
    sort-by-drawing-order coords

  sort-by-drawing-order = (raw-coords) ->
    neat-coords = [ { index, x, y } for index, { x, y } of raw-coords ]
    rows = values group-by (.y), neat-coords
    rows.sort (a, b) -> a.0.y < b.0.y
    rows.map (.sort (a, b) -> a.x > b.x)
    return rows

  draw-room-with-neighbours = (room, ox, oy) ->
    links = level-data.links[room]
    draw-neighbour links, \down, ox, oy
    draw-neighbour links, \left, ox, oy
    level-data.rooms[room].blit-to main-blitter, ox, oy
    draw-neighbour links, \right, ox, oy
    draw-neighbour links, \up, ox, oy

  draw-neighbour = (links, dir, ox, oy) ->
    if links[dir]
      { x, y } = get-room-offsets dir
      level-data.rooms[that].blit-to main-blitter, ox + x, oy + y

  draw-all-rooms = (coord-rows, px, py) ->

    main-blitter.clear!

    cx = floor (main-blitter.canvas.width - tile-x * room-width) / 2
    cy = floor (main-blitter.canvas.height - tile-y * room-height) / 2

    for row in coord-rows
      for { index, x, y } in row
        rx = tile-x * room-width * x
        ry = tile-y * room-height * y
        level-data.rooms[index].blit-to main-blitter, cx + rx + px, cy + ry + py

  update-room-renders = ->
    for room in level-data.rooms
      room.render!


  # State

  pan         = { x: 0, y: 0 }
  last-mouse  = { x: 0, y: 0 }
  dragging    = off
  room-coords = discover-room-positions level-data.start.room


  # Listeners

  main-blitter.on \mousedown, -> dragging := on
  main-blitter.on \mouseup,   -> dragging := off

  main-blitter.on \mousemove, (event) ->
    Δx = last-mouse.x - event.offset-x
    Δy = last-mouse.y - event.offset-y

    last-mouse.x = event.offset-x
    last-mouse.y = event.offset-y

    if dragging
      pan.x -= Δx
      pan.y -= Δy
      main-blitter.clear!
      draw-all-rooms room-coords, pan.x, pan.y


  # Init

  main-blitter.install document.body

  delay 1000, ->
    update-room-renders!
    draw-all-rooms room-coords, 0, 0

