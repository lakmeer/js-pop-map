
# Require

{ id, log, div } = require \std

{ PopRoom } = require \./room


#
# PopLevel
#
# Given some raw PLV data, parse it out into a structured object
#

export class PopLevel

  POP_ROOM_SIZE = 30

  spec =           # Offset, length
    foretable       : { length: 720, offset: 0 }
    backtable       : { length: 720  offset: 720 }
    door-a          : { length: 256  offset: 1440 }
    door-b          : { length: 256  offset: 1696 }
    links           : { length: 96   offset: 1952 }
    unknown1        : { length: 64   offset: 2048 }
    start-position  : { length: 3    offset: 2112 }
    unknown2        : { length: 3    offset: 2115 }
    unknown3        : { length: 1    offset: 2116 }
    guard-location  : { length: 24   offset: 2119 }
    guard-direction : { length: 24   offset: 2143 }
    unknown4a       : { length: 24   offset: 2167 }
    unknown4b       : { length: 24   offset: 2191 }
    guard-skill     : { length: 24   offset: 2215 }
    unknown4c       : { length: 24   offset: 2239 }
    guard-colour    : { length: 24   offset: 2263 }
    unknown4d       : { length: 16   offset: 2287 }
    end             : { length: 2    offset: 2303 }

  (raw) ->
    log "new PopLevel"

    @buffer = new Uint8Array raw
    @rooms = @extract-room-tiles

  extract-room-tiles: (buffer) ->
    rooms = for i from 0 to 24
      start-index = spec.foretable.offset + i * POP_ROOM_SIZE
      end-index   = start-index + POP_ROOM_SIZE
      new PopRoom buffer.subarray start-index, end-index

