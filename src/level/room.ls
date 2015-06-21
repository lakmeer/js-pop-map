
# Require

{ id, log, div } = require \std

{ ForeTile } = require \./foretile
#{ BackTile } = require \./backtile


#
# Pop Room
#
# 30-byte chunk containing tiles for one dungeon room
#

export class PopRoom

  POP_ROOM_SIZE = 30

  (@forebuffer, @backbuffer) ->
    @foretiles = [[], [], []]
    @backtiles = [[], [], []]

    for i from 0 til POP_ROOM_SIZE
      x = i % 10
      y = i `div` 10
      @foretiles[y][x] = new ForeTile @forebuffer[i]
      @backtiles[y][x] = new BackTile @backbuffer[i]

