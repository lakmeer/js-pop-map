
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
  POP_LINK_SIZE = 4
  POP_PREAMBLE_OFFSET = 18

  spec =
    foretable       : { offset: 0,    length: 720 }
    backtable       : { offset: 720,  length: 720 }
    links           : { offset: 1952, length: 96  }
    door-a          : { offset: 1440, length: 256 }
    door-b          : { offset: 1696, length: 256 }
    start-position  : { offset: 2112, length: 3   }
    guard-location  : { offset: 2119, length: 24  }
    guard-direction : { offset: 2143, length: 24  }
    guard-skill     : { offset: 2215, length: 24  }
    guard-colour    : { offset: 2263, length: 24  }
    unknown1        : { offset: 2048, length: 64  }
    unknown2        : { offset: 2115, length: 3   }
    unknown3        : { offset: 2116, length: 1   }
    unknown4a       : { offset: 2167, length: 24  }
    unknown4b       : { offset: 2191, length: 24  }
    unknown4c       : { offset: 2239, length: 24  }
    unknown4d       : { offset: 2287, length: 16  }
    end             : { offset: 2303, length: 2   }

  FACING =
    LEFT    : Symbol "FACING_LEFT"
    RIGHT   : Symbol "FACING_RIGHT"
    UNKNOWN : Symbol "FACING_UNKNOWN"

  LINKING =
    LEFT  : 0
    RIGHT : 1
    UP    : 2
    DOWN  : 3

  get-facing = ->
    | 0   => FACING.LEFT
    | 255 => FACING.RIGHT
    | _   => FACING.UNKNOWN

  spec-slice = (buffer, chunk) ->
    buffer.subarray chunk.offset, chunk.offset + chunk.length

  (raw) ->
    log "new PopLevel"

    # Prepare raw PLV data to be read
    @full = new Uint8Array raw
    @data = @full.subarray POP_PREAMBLE_OFFSET + 1, @full.length - POP_PREAMBLE_OFFSET

    # Parse out the bits we care about
    @rooms  = @extract-rooms @data
    @links  = @extract-links @data
    @start  = @extract-start @data

  extract-rooms: (buffer) ->
    rooms = for i from 0 to 24
      start-index = spec.foretable.offset + i * POP_ROOM_SIZE
      end-index   = start-index + POP_ROOM_SIZE
      new PopRoom i + 1, buffer.subarray start-index, end-index
    rooms.unshift PopRoom.NullRoom
    return rooms

  extract-links: (buffer) ->
    links = for i from 0 to 24
      start-index = spec.links.offset + i * POP_LINK_SIZE
      end-index = start-index + POP_LINK_SIZE
      link-data = buffer.subarray start-index, end-index
      up: link-data[LINKING.UP]
      down: link-data[LINKING.DOWN]
      left: link-data[LINKING.LEFT]
      right: link-data[LINKING.RIGHT]
    links.unshift {}
    return links

  extract-start: (buffer) ->
    data = spec-slice buffer, spec.start-position
    room: data.0
    tile: data.1
    facing: get-facing data.2

