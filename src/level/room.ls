
# Require

{ id, log, delay, div } = require \std

{ tile-x, tile-y, tiles-per-room, tile-overlap, room-width, room-height } = require \../config

{ Assets }   = require \../assets
{ Blitter }  = require \../blitter

{ ForeTile } = require \./foretile
#{ BackTile } = require \./backtile


#
# Pop Room
#
# 30-byte chunk containing tiles for one dungeon room
#

export class PopRoom

  (@index, @forebuffer, @backbuffer) ->
    @foretiles = [[], [], []]
    @backtiles = [[], [], []]

    @blitter = new Blitter tile-x * (room-width + 1), tile-y * room-height + tile-overlap

    for i from 0 til tiles-per-room
      x = i % room-width
      y = i `div` room-width
      @foretiles[y][x] = new ForeTile @forebuffer[i], x, y
      #@backtiles[y][x] = new BackTile @backbuffer[i], x, y

    delay 100, ~> @render!

  render: ->
    tiles = @foretiles

    @blitter.draw-with ->
      for row-ix from 2 to 0
        row = tiles[row-ix]

        for tile in row
          image = Assets.get tile.name

          if Assets.is-none image
            @fill-style = \white
            @stroke-text tile.code.to-string(16), tile.x * tile-x + tile-x, tile.y * tile-y + tile-y * 0.7
            @fill-text   tile.code.to-string(16), tile.x * tile-x + tile-x, tile.y * tile-y + tile-y * 0.7
            void
          else
            @draw-image image, tile.x * tile-x, tile.y * tile-y

  blit-to: (target, x, y) ->
    target.ctx.draw-image @blitter.canvas, x, y



