
# Require

{ id, log } = require \std

load-img = (src) -> i = new Image; i.src = \/tiles/ + src + \.png; return i


# Load all assets

sprites =
  null       : new Image
  blank      : new Image
  wall       : load-img \wall
  torch      : load-img \torch
  floor      : load-img \floor
  pillar     : load-img \pillars
  debris     : load-img \debris
  unstable   : load-img \unstable
  gate       : load-img \gate
  plate      : load-img \plate
  red        : load-img \potion-red
  slam       : load-img \slam
  spikes     : load-img \spikes
  exit-left  : load-img \exit-left
  exit-right : load-img \exit-right
  skeleton   : load-img \skeleton
  sword      : load-img \sword


# Provide external interface to asset library

export Assets =
  get: ->
    switch it
    | "Empty"        => sprites.blank
    | "Torch"        => sprites.torch
    | "Spikes"       => sprites.spikes
    | "Wall"         => sprites.wall
    | "Floor"        => sprites.floor
    | "Pillar"       => sprites.pillar
    | "Debris"       => sprites.debris
    | "Loose Board"  => sprites.unstable
    | "Gate"         => sprites.gate
    | "Potion"       => sprites.red
    | "Raise Button" => sprites.plate
    | "Drop Button"  => sprites.slam
    | "Exit Left"    => sprites.exit-left
    | "Exit Right"   => sprites.exit-right
    | "Skeleton"     => sprites.skeleton
    | "Sword"        => sprites.sword
    | otherwise      => sprites.null

  is-none: (asset) ->
    asset is sprites.null

