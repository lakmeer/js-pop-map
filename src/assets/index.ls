
# Require

{ id, log } = require \std


# Helpers

load-img = (src) -> i = new Image; i.src = \/tiles/ + src + \.png; return i

null-sprite = {}

export is-none = (is null-sprite)


# Provide external interface to given sprite library

getter = (sprites) ->
  get: ->
    switch it
    | "Empty"             => sprites.blank
    | "Torch"             => sprites.torch
    | "Spikes"            => sprites.spikes
    | "Wall"              => sprites.wall
    | "Floor"             => sprites.floor
    | "Pillar"            => sprites.pillar
    | "Chopper"           => sprites.chopper
    | "Debris"            => sprites.debris
    | "Loose Board"       => sprites.unstable
    | "Gate"              => sprites.gate
    | "Potion"            => sprites.red
    | "Raise Button"      => sprites.plate
    | "Drop Button"       => sprites.slam
    | "Exit Left"         => sprites.exit-left
    | "Exit Right"        => sprites.exit-right
    | "Skeleton"          => sprites.skeleton
    | "Sword"             => sprites.sword
    | "Tapestry Top"      => sprites.tapestry-top
    | "Top Big-pillar"    => sprites.column-top
    | "Bottom Big-pillar" => sprites.column-btm
    | otherwise           => log it; null-sprite


# Define sprite sets

export Dungeon = getter do
  blank      : new Image
  wall       : load-img \dungeon/wall
  torch      : load-img \dungeon/torch
  floor      : load-img \dungeon/floor
  pillar     : load-img \dungeon/pillars
  debris     : load-img \dungeon/debris
  unstable   : load-img \dungeon/unstable
  gate       : load-img \dungeon/gate
  plate      : load-img \dungeon/plate
  red        : load-img \dungeon/potion-red
  slam       : load-img \dungeon/slam
  spikes     : load-img \dungeon/spikes
  exit-left  : load-img \dungeon/exit-left
  exit-right : load-img \dungeon/exit-right
  skeleton   : load-img \dungeon/skeleton
  sword      : load-img \dungeon/sword
  column-top : load-img \dungeon/columns-top
  column-btm : load-img \dungeon/columns-btm
  chopper    : load-img \dungeon/chopper
  tapestry-top: load-img \dungeon/tapestry-top

export Palace = getter {}
  #blank      : new Image
  #wall       : load-img \palace/wall
  #torch      : load-img \palace/torch
  #floor      : load-img \palace/floor
  #pillar     : load-img \palace/pillars
  #debris     : load-img \palace/debris
  #unstable   : load-img \palace/unstable
  #gate       : load-img \palace/gate
  #plate      : load-img \palace/plate
  #red        : load-img \palace/potion-red
  #slam       : load-img \palace/slam
  #spikes     : load-img \palace/spikes
  #exit-left  : load-img \palace/exit-left
  #exit-right : load-img \palace/exit-right
  #skeleton   : load-img \palace/skeleton
  #sword      : load-img \palace/sword
  #column-top : load-img \palace/columns-top
  #column-btm : load-img \palace/columns-btm
  #chopper    : load-img \palace/chopper
  #tapestry-top: load-img \palace/tapestry-top

