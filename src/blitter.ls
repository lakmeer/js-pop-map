
export class Blitter
  (w, h) ->
    @canvas = document.create-element \canvas
    @ctx    = @canvas.get-context \2d
    @canvas.width  = w
    @canvas.height = h

    @set-debug-font!

  draw-with: (λ) ->
    λ.call @ctx, @canvas.width, @canvas.height

  on: (event, λ) ->
    @canvas.add-event-listener event, λ

  blit-to: (target, x, y) ->
    target.ctx.draw-image @canvas, @canvas.width, @canvas.height

  clear: ->
    @ctx.clear-rect 0, 0, @canvas.width, @canvas.height

  install: (host) ->
    host.append-child @canvas

  set-debug-font: ->
    @ctx.text-baseline = \middle
    @ctx.text-align = \center
    @ctx.font = "16px monospace"

