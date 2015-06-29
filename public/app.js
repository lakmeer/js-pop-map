(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, id, log, keys, floor, randomFrom, delay, every, groupBy, values, reverse, Dungeon, Palace, Blitter, PopLevel, tileX, tileY, tilesPerRoom, roomWidth, roomHeight, levelData, xhr;
ref$ = require('std'), id = ref$.id, log = ref$.log, keys = ref$.keys, floor = ref$.floor, randomFrom = ref$.randomFrom, delay = ref$.delay, every = ref$.every, groupBy = ref$.groupBy, values = ref$.values, reverse = ref$.reverse;
ref$ = require('./assets'), Dungeon = ref$.Dungeon, Palace = ref$.Palace;
Blitter = require('./blitter').Blitter;
PopLevel = require('./level').PopLevel;
ref$ = require('./config'), tileX = ref$.tileX, tileY = ref$.tileY, tilesPerRoom = ref$.tilesPerRoom, roomWidth = ref$.roomWidth, roomHeight = ref$.roomHeight;
levelData = {};
xhr = new XMLHttpRequest;
xhr.open('GET', "levels/04.plv", true);
xhr.responseType = 'arraybuffer';
xhr.send();
xhr.onload = function(){
  var mainBlitter, getRoomOffsets, getRoomCoords, discoverRoomPositions, sortByDrawingOrder, drawRoomWithNeighbours, drawNeighbour, drawAllRooms, updateRoomRenders, pan, lastMouse, dragging, roomCoords;
  levelData = new PopLevel(this.response, Palace);
  mainBlitter = new Blitter(window.innerWidth, window.innerHeight);
  getRoomOffsets = function(it){
    switch (it) {
    case 'up':
      return {
        x: 0,
        y: tileY * -roomHeight
      };
    case 'down':
      return {
        x: 0,
        y: tileY * roomHeight
      };
    case 'left':
      return {
        x: tileX * -roomWidth,
        y: 0
      };
    case 'right':
      return {
        x: tileX * roomWidth,
        y: 0
      };
    }
  };
  getRoomCoords = function(dir, arg$){
    var x, y;
    x = arg$.x, y = arg$.y;
    switch (dir) {
    case 'up':
      return {
        x: x,
        y: y - 1
      };
    case 'down':
      return {
        x: x,
        y: y + 1
      };
    case 'left':
      return {
        x: x - 1,
        y: y
      };
    case 'right':
      return {
        x: x + 1,
        y: y
      };
    default:
      return console.error('What?');
    }
  };
  discoverRoomPositions = function(room){
    var coords, fetchUnresolved;
    coords = [];
    coords[room] = {
      x: 0,
      y: 0
    };
    fetchUnresolved = function(room){
      var links, dir, index, results$ = [];
      links = levelData.links[room];
      for (dir in links) {
        index = links[dir];
        if (!coords[index]) {
          coords[index] = getRoomCoords(dir, coords[room]);
          results$.push(fetchUnresolved(index));
        }
      }
      return results$;
    };
    fetchUnresolved(room);
    return sortByDrawingOrder(coords);
  };
  sortByDrawingOrder = function(rawCoords){
    var neatCoords, res$, index, ref$, x, y, rows;
    res$ = [];
    for (index in rawCoords) {
      ref$ = rawCoords[index], x = ref$.x, y = ref$.y;
      res$.push({
        index: index,
        x: x,
        y: y
      });
    }
    neatCoords = res$;
    rows = values(groupBy(function(it){
      return it.y;
    }, neatCoords));
    rows.sort(function(a, b){
      return a[0].y < b[0].y;
    });
    rows.map(function(it){
      return it.sort(function(a, b){
        return a.x > b.x;
      });
    });
    return rows;
  };
  drawRoomWithNeighbours = function(room, ox, oy){
    var links;
    links = levelData.links[room];
    drawNeighbour(links, 'down', ox, oy);
    drawNeighbour(links, 'left', ox, oy);
    levelData.rooms[room].blitTo(mainBlitter, ox, oy);
    drawNeighbour(links, 'right', ox, oy);
    return drawNeighbour(links, 'up', ox, oy);
  };
  drawNeighbour = function(links, dir, ox, oy){
    var that, ref$, x, y;
    if (that = links[dir]) {
      ref$ = getRoomOffsets(dir), x = ref$.x, y = ref$.y;
      return levelData.rooms[that].blitTo(mainBlitter, ox + x, oy + y);
    }
  };
  drawAllRooms = function(coordRows, px, py){
    var cx, cy, i$, len$, row, lresult$, j$, len1$, ref$, index, x, y, rx, ry, results$ = [];
    mainBlitter.clear();
    cx = floor((mainBlitter.canvas.width - tileX * roomWidth) / 2);
    cy = floor((mainBlitter.canvas.height - tileY * roomHeight) / 2);
    for (i$ = 0, len$ = coordRows.length; i$ < len$; ++i$) {
      row = coordRows[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        ref$ = row[j$], index = ref$.index, x = ref$.x, y = ref$.y;
        rx = tileX * roomWidth * x;
        ry = tileY * roomHeight * y;
        lresult$.push(levelData.rooms[index].blitTo(mainBlitter, cx + rx + px, cy + ry + py));
      }
      results$.push(lresult$);
    }
    return results$;
  };
  updateRoomRenders = function(){
    var i$, ref$, len$, room, results$ = [];
    for (i$ = 0, len$ = (ref$ = levelData.rooms).length; i$ < len$; ++i$) {
      room = ref$[i$];
      results$.push(room.render());
    }
    return results$;
  };
  pan = {
    x: 0,
    y: 0
  };
  lastMouse = {
    x: 0,
    y: 0
  };
  dragging = false;
  roomCoords = discoverRoomPositions(levelData.start.room);
  mainBlitter.on('mousedown', function(){
    return dragging = true;
  });
  mainBlitter.on('mouseup', function(){
    return dragging = false;
  });
  mainBlitter.on('mousemove', function(event){
    var Δx, Δy;
    Δx = lastMouse.x - event.offsetX;
    Δy = lastMouse.y - event.offsetY;
    lastMouse.x = event.offsetX;
    lastMouse.y = event.offsetY;
    if (dragging) {
      pan.x -= Δx;
      pan.y -= Δy;
      mainBlitter.clear();
      return drawAllRooms(roomCoords, pan.x, pan.y);
    }
  });
  mainBlitter.install(document.body);
  return delay(1000, function(){
    updateRoomRenders();
    return drawAllRooms(roomCoords, 0, 0);
  });
};
},{"./assets":2,"./blitter":3,"./config":4,"./level":6,"std":8}],2:[function(require,module,exports){
var ref$, id, log, loadImg, nullSprite, isNone, getter, Dungeon, Palace, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
loadImg = function(src){
  var i;
  i = new Image;
  i.src = '/tiles/' + src + '.png';
  return i;
};
nullSprite = {};
out$.isNone = isNone = (function(it){
  return it === nullSprite;
});
getter = function(sprites){
  return {
    get: function(it){
      switch (it.name) {
      case "Empty":
        return sprites.blank;
      case "Torch":
        return sprites.torch;
      case "Spikes":
        return sprites.spikes;
      case "Wall":
        return sprites.wall;
      case "Floor":
        return sprites.floor;
      case "Pillar":
        return sprites.pillar;
      case "Chopper":
        return sprites.chopper;
      case "Debris":
        return sprites.debris;
      case "Loose Board":
        return sprites.unstable;
      case "Gate":
        return sprites.gate;
      case "Potion":
        return sprites.red;
      case "Raise Button":
        return sprites.plate;
      case "Drop Button":
        return sprites.slam;
      case "Exit Left":
        return sprites.exitLeft;
      case "Exit Right":
        return sprites.exitRight;
      case "Skeleton":
        return sprites.skeleton;
      case "Sword":
        return sprites.sword;
      case "Tapestry Top":
        return sprites.tapestryTop;
      case "Top Big-pillar":
        return sprites.columnTop;
      case "Bottom Big-pillar":
        return sprites.columnBtm;
      case "Lattice Pillar":
        return sprites.latticePillar;
      case "Lattice Support":
        return sprites.latticeSupport;
      case "Small Lattice":
        return sprites.latticeSmall;
      case "Lattice Left":
        return sprites.latticeLeft;
      case "Lattice Right":
        return sprites.latticeRight;
      default:
        log(it.name, it.code.toString(16));
        return nullSprite;
      }
    }
  };
};
out$.Dungeon = Dungeon = getter({
  blank: new Image,
  wall: loadImg('dungeon/wall'),
  torch: loadImg('dungeon/torch'),
  floor: loadImg('dungeon/floor'),
  pillar: loadImg('dungeon/pillars'),
  debris: loadImg('dungeon/debris'),
  unstable: loadImg('dungeon/unstable'),
  gate: loadImg('dungeon/gate'),
  plate: loadImg('dungeon/plate'),
  red: loadImg('dungeon/potion-red'),
  slam: loadImg('dungeon/slam'),
  spikes: loadImg('dungeon/spikes'),
  exitLeft: loadImg('dungeon/exit-left'),
  exitRight: loadImg('dungeon/exit-right'),
  skeleton: loadImg('dungeon/skeleton'),
  sword: loadImg('dungeon/sword'),
  columnTop: loadImg('dungeon/columns-top'),
  columnBtm: loadImg('dungeon/columns-btm'),
  chopper: loadImg('dungeon/chopper'),
  tapestryTop: loadImg('dungeon/tapestry-top')
});
out$.Palace = Palace = getter({
  blank: new Image,
  wall: loadImg('palace/wall'),
  torch: loadImg('palace/torch'),
  floor: loadImg('palace/floor'),
  pillar: loadImg('palace/pillars'),
  debris: loadImg('palace/debris'),
  unstable: loadImg('palace/unstable'),
  gate: loadImg('palace/gate'),
  plate: loadImg('palace/plate'),
  red: loadImg('palace/potion-red'),
  slam: loadImg('palace/slam'),
  spikes: loadImg('palace/spikes'),
  exitLeft: loadImg('palace/exit-left'),
  exitRight: loadImg('palace/exit-right'),
  chopper: loadImg('palace/chopper'),
  tapestryTop: loadImg('palace/tapestry-top'),
  latticePillar: loadImg('palace/lattice-pillar'),
  latticeSupport: loadImg('palace/lattice-support'),
  latticeSmall: loadImg('palace/lattice-small'),
  latticeLeft: loadImg('palace/lattice-left'),
  latticeRight: loadImg('palace/lattice-right')
});
},{"std":8}],3:[function(require,module,exports){
var Blitter, out$ = typeof exports != 'undefined' && exports || this;
out$.Blitter = Blitter = (function(){
  Blitter.displayName = 'Blitter';
  var prototype = Blitter.prototype, constructor = Blitter;
  function Blitter(w, h){
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = w;
    this.canvas.height = h;
    this.setDebugFont();
  }
  prototype.drawWith = function(λ){
    return λ.call(this.ctx, this.canvas.width, this.canvas.height);
  };
  prototype.on = function(event, λ){
    return this.canvas.addEventListener(event, λ);
  };
  prototype.blitTo = function(target, x, y){
    return target.ctx.drawImage(this.canvas, this.canvas.width, this.canvas.height);
  };
  prototype.clear = function(){
    return this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  prototype.install = function(host){
    return host.appendChild(this.canvas);
  };
  prototype.setDebugFont = function(){
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    return this.ctx.font = "16px monospace";
  };
  return Blitter;
}());
},{}],4:[function(require,module,exports){
var tileX, tileY, zz, tileOverlap, roomWidth, roomHeight, tilesPerRoom, out$ = typeof exports != 'undefined' && exports || this;
out$.tileX = tileX = 32;
out$.tileY = tileY = 63;
out$.zz = zz = 10;
out$.tileOverlap = tileOverlap = 15;
out$.roomWidth = roomWidth = 10;
out$.roomHeight = roomHeight = 3;
out$.tilesPerRoom = tilesPerRoom = roomWidth * roomHeight;
},{}],5:[function(require,module,exports){
var ForeTile, out$ = typeof exports != 'undefined' && exports || this;
out$.ForeTile = ForeTile = (function(){
  ForeTile.displayName = 'ForeTile';
  var foretableTileTypes, prototype = ForeTile.prototype, constructor = ForeTile;
  foretableTileTypes = [
    {
      code: 0x00,
      group: 'free',
      name: "Empty"
    }, {
      code: 0x01,
      group: 'free',
      name: "Floor"
    }, {
      code: 0x02,
      group: 'spike',
      name: "Spikes"
    }, {
      code: 0x03,
      group: 'none',
      name: "Pillar"
    }, {
      code: 0x04,
      group: 'gate',
      name: "Gate"
    }, {
      code: 0x05,
      group: 'none',
      name: "Stuck Button"
    }, {
      code: 0x06,
      group: 'event',
      name: "Drop Button"
    }, {
      code: 0x07,
      group: 'tapest',
      name: "Tapestry"
    }, {
      code: 0x08,
      group: 'none',
      name: "Bottom Big-pillar"
    }, {
      code: 0x09,
      group: 'none',
      name: "Top Big-pillar"
    }, {
      code: 0x0A,
      group: 'potion',
      name: "Potion"
    }, {
      code: 0x0B,
      group: 'none',
      name: "Loose Board"
    }, {
      code: 0x0C,
      group: 'ttop',
      name: "Tapestry Top"
    }, {
      code: 0x0D,
      group: 'none',
      name: "Mirror"
    }, {
      code: 0x0E,
      group: 'none',
      name: "Debris"
    }, {
      code: 0x0F,
      group: 'event',
      name: "Raise Button"
    }, {
      code: 0x10,
      group: 'none',
      name: "Exit Left"
    }, {
      code: 0x11,
      group: 'none',
      name: "Exit Right"
    }, {
      code: 0x12,
      group: 'chomp',
      name: "Chopper"
    }, {
      code: 0x13,
      group: 'none',
      name: "Torch"
    }, {
      code: 0x14,
      group: 'wall',
      name: "Wall"
    }, {
      code: 0x15,
      group: 'none',
      name: "Skeleton"
    }, {
      code: 0x16,
      group: 'none',
      name: "Sword"
    }, {
      code: 0x17,
      group: 'none',
      name: "Balcony Left"
    }, {
      code: 0x18,
      group: 'none',
      name: "Balcony Right"
    }, {
      code: 0x19,
      group: 'none',
      name: "Lattice Pillar"
    }, {
      code: 0x1A,
      group: 'none',
      name: "Lattice Support"
    }, {
      code: 0x1B,
      group: 'none',
      name: "Small Lattice"
    }, {
      code: 0x1C,
      group: 'none',
      name: "Lattice Left"
    }, {
      code: 0x1D,
      group: 'none',
      name: "Lattice Right"
    }, {
      code: 0x1E,
      group: 'none',
      name: "Torch with Debris"
    }, {
      code: 0x1F,
      group: 'none',
      name: "Null"
    }
  ];
  function ForeTile(byte, x, y){
    var data;
    this.byte = byte;
    this.x = x;
    this.y = y;
    data = foretableTileTypes[this.byte & 0x1F];
    import$(this, data);
    this.modified = (this.byte & 0x20) >> 5;
  }
  return ForeTile;
}());
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{}],6:[function(require,module,exports){
var ref$, id, log, div, PopRoom, PopLevel, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, div = ref$.div;
PopRoom = require('./room').PopRoom;
out$.PopLevel = PopLevel = (function(){
  PopLevel.displayName = 'PopLevel';
  var POP_ROOM_SIZE, POP_LINK_SIZE, POP_PREAMBLE_OFFSET, spec, FACING, LINKING, getFacing, specSlice, prototype = PopLevel.prototype, constructor = PopLevel;
  POP_ROOM_SIZE = 30;
  POP_LINK_SIZE = 4;
  POP_PREAMBLE_OFFSET = 18;
  spec = {
    foretable: {
      offset: 0,
      length: 720
    },
    backtable: {
      offset: 720,
      length: 720
    },
    links: {
      offset: 1952,
      length: 96
    },
    doorA: {
      offset: 1440,
      length: 256
    },
    doorB: {
      offset: 1696,
      length: 256
    },
    startPosition: {
      offset: 2112,
      length: 3
    },
    guardLocation: {
      offset: 2119,
      length: 24
    },
    guardDirection: {
      offset: 2143,
      length: 24
    },
    guardSkill: {
      offset: 2215,
      length: 24
    },
    guardColour: {
      offset: 2263,
      length: 24
    },
    unknown1: {
      offset: 2048,
      length: 64
    },
    unknown2: {
      offset: 2115,
      length: 3
    },
    unknown3: {
      offset: 2116,
      length: 1
    },
    unknown4a: {
      offset: 2167,
      length: 24
    },
    unknown4b: {
      offset: 2191,
      length: 24
    },
    unknown4c: {
      offset: 2239,
      length: 24
    },
    unknown4d: {
      offset: 2287,
      length: 16
    },
    end: {
      offset: 2303,
      length: 2
    }
  };
  FACING = {
    LEFT: Symbol("FACING_LEFT"),
    RIGHT: Symbol("FACING_RIGHT"),
    UNKNOWN: Symbol("FACING_UNKNOWN")
  };
  LINKING = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3
  };
  getFacing = function(){
    switch (false) {
    case !0:
      return FACING.LEFT;
    case !255:
      return FACING.RIGHT;
    default:
      return FACING.UNKNOWN;
    }
  };
  specSlice = function(buffer, chunk){
    return buffer.subarray(chunk.offset, chunk.offset + chunk.length);
  };
  function PopLevel(raw, spriteSet){
    log("new PopLevel");
    this.full = new Uint8Array(raw);
    this.data = this.full.subarray(POP_PREAMBLE_OFFSET + 1, this.full.length - POP_PREAMBLE_OFFSET);
    this.rooms = this.extractRooms(this.data, spriteSet);
    this.links = this.extractLinks(this.data);
    this.start = this.extractStart(this.data);
  }
  prototype.extractRooms = function(buffer, spriteSet){
    var rooms, res$, i$, i, startIndex, endIndex;
    log('xr', spriteSet.get);
    res$ = [];
    for (i$ = 0; i$ <= 24; ++i$) {
      i = i$;
      startIndex = spec.foretable.offset + i * POP_ROOM_SIZE;
      endIndex = startIndex + POP_ROOM_SIZE;
      res$.push(new PopRoom({
        index: i + 1,
        forebuffer: buffer.subarray(startIndex, endIndex),
        backbuffer: null,
        spriteSet: spriteSet
      }));
    }
    rooms = res$;
    rooms.unshift(PopRoom.NullRoom);
    return rooms;
  };
  prototype.extractLinks = function(buffer){
    var links, res$, i$, i, startIndex, endIndex, linkData;
    res$ = [];
    for (i$ = 0; i$ <= 24; ++i$) {
      i = i$;
      startIndex = spec.links.offset + i * POP_LINK_SIZE;
      endIndex = startIndex + POP_LINK_SIZE;
      linkData = buffer.subarray(startIndex, endIndex);
      res$.push({
        up: linkData[LINKING.UP],
        down: linkData[LINKING.DOWN],
        left: linkData[LINKING.LEFT],
        right: linkData[LINKING.RIGHT]
      });
    }
    links = res$;
    links.unshift({});
    return links;
  };
  prototype.extractStart = function(buffer){
    var data;
    data = specSlice(buffer, spec.startPosition);
    return {
      room: data[0],
      tile: data[1],
      facing: getFacing(data[2])
    };
  };
  return PopLevel;
}());
},{"./room":7,"std":8}],7:[function(require,module,exports){
var ref$, id, log, delay, div, tileX, tileY, tilesPerRoom, tileOverlap, roomWidth, roomHeight, isNone, Blitter, ForeTile, PopRoom, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, delay = ref$.delay, div = ref$.div;
ref$ = require('../config'), tileX = ref$.tileX, tileY = ref$.tileY, tilesPerRoom = ref$.tilesPerRoom, tileOverlap = ref$.tileOverlap, roomWidth = ref$.roomWidth, roomHeight = ref$.roomHeight;
isNone = require('../assets').isNone;
Blitter = require('../blitter').Blitter;
ForeTile = require('./foretile').ForeTile;
out$.PopRoom = PopRoom = (function(){
  PopRoom.displayName = 'PopRoom';
  var prototype = PopRoom.prototype, constructor = PopRoom;
  function PopRoom(arg$){
    var i$, to$, i, x, y, this$ = this;
    this.index = arg$.index, this.forebuffer = arg$.forebuffer, this.backbuffer = arg$.backbuffer, this.spriteSet = arg$.spriteSet;
    this.blitter = new Blitter(tileX * (roomWidth + 1), tileY * roomHeight + tileOverlap);
    this.foretiles = [[], [], []];
    this.backtiles = [[], [], []];
    for (i$ = 0, to$ = tilesPerRoom; i$ < to$; ++i$) {
      i = i$;
      x = i % roomWidth;
      y = div(i, roomWidth);
      this.foretiles[y][x] = new ForeTile(this.forebuffer[i], x, y);
    }
    delay(100, function(){
      return this$.render();
    });
  }
  prototype.render = function(){
    var tiles, sprites;
    tiles = this.foretiles;
    sprites = this.spriteSet;
    this.blitter.clear();
    return this.blitter.drawWith(function(){
      var i$, rowIx, lresult$, row, j$, len$, tile, image, results$ = [];
      for (i$ = 2; i$ >= 0; --i$) {
        rowIx = i$;
        lresult$ = [];
        row = tiles[rowIx];
        for (j$ = 0, len$ = row.length; j$ < len$; ++j$) {
          tile = row[j$];
          image = sprites.get(tile);
          if (isNone(image) || !image) {
            this.fillStyle = 'white';
            this.strokeText(tile.code.toString(16), tile.x * tileX + tileX, tile.y * tileY + tileY * 0.7);
            this.fillText(tile.code.toString(16), tile.x * tileX + tileX, tile.y * tileY + tileY * 0.7);
            lresult$.push(void 8);
          } else {
            lresult$.push(this.drawImage(image, tile.x * tileX, tile.y * tileY));
          }
        }
        results$.push(lresult$);
      }
      return results$;
    });
  };
  prototype.blitTo = function(target, x, y){
    return target.ctx.drawImage(this.blitter.canvas, x, y);
  };
  PopRoom.NullRoom = {
    render: id,
    blitTo: id,
    index: 0
  };
  return PopRoom;
}());
},{"../assets":2,"../blitter":3,"../config":4,"./foretile":5,"std":8}],8:[function(require,module,exports){
var id, log, min, max, floor, round, sin, cos, tau, flip, delay, every, div, random, randomFrom, reverse, keys, values, groupBy, out$ = typeof exports != 'undefined' && exports || this;
out$.id = id = function(it){
  return it;
};
out$.log = log = function(){
  console.log.apply(console, arguments);
  return arguments[0];
};
out$.min = min = Math.min;
out$.max = max = Math.max;
out$.floor = floor = Math.floor;
out$.round = round = Math.round;
out$.sin = sin = Math.sin;
out$.cos = cos = Math.cos;
out$.tau = tau = Math.PI * 2;
out$.flip = flip = function(λ){
  return function(a, b){
    return λ(b, a);
  };
};
out$.delay = delay = flip(setTimeout);
out$.every = every = flip(setInterval);
out$.div = div = curry$(function(a, b){
  return floor(a / b);
});
out$.random = random = function(it){
  return Math.random() * it;
};
out$.randomFrom = randomFrom = function(list){
  return list[floor(random(list.length - 1))];
};
out$.reverse = reverse = function(it){
  return it.reverse();
};
out$.keys = keys = function(it){
  var k, v, results$ = [];
  for (k in it) {
    v = it[k];
    results$.push(k);
  }
  return results$;
};
out$.values = values = function(it){
  var k, v, results$ = [];
  for (k in it) {
    v = it[k];
    results$.push(v);
  }
  return results$;
};
out$.groupBy = groupBy = function(λ, list){
  var o, i$, len$, x, key$;
  o = {};
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    x = list[i$];
    (o[key$ = λ(x)] || (o[key$] = [])).push(x);
  }
  return o;
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2Fzc2V0cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2JsaXR0ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9jb25maWcubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9sZXZlbC9mb3JldGlsZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2xldmVsL2luZGV4LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbGV2ZWwvcm9vbS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL3N0ZC9pbmRleC5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBpZCwgbG9nLCBrZXlzLCBmbG9vciwgcmFuZG9tRnJvbSwgZGVsYXksIGV2ZXJ5LCBncm91cEJ5LCB2YWx1ZXMsIHJldmVyc2UsIER1bmdlb24sIFBhbGFjZSwgQmxpdHRlciwgUG9wTGV2ZWwsIHRpbGVYLCB0aWxlWSwgdGlsZXNQZXJSb29tLCByb29tV2lkdGgsIHJvb21IZWlnaHQsIGxldmVsRGF0YSwgeGhyO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBrZXlzID0gcmVmJC5rZXlzLCBmbG9vciA9IHJlZiQuZmxvb3IsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb20sIGRlbGF5ID0gcmVmJC5kZWxheSwgZXZlcnkgPSByZWYkLmV2ZXJ5LCBncm91cEJ5ID0gcmVmJC5ncm91cEJ5LCB2YWx1ZXMgPSByZWYkLnZhbHVlcywgcmV2ZXJzZSA9IHJlZiQucmV2ZXJzZTtcbnJlZiQgPSByZXF1aXJlKCcuL2Fzc2V0cycpLCBEdW5nZW9uID0gcmVmJC5EdW5nZW9uLCBQYWxhY2UgPSByZWYkLlBhbGFjZTtcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xuUG9wTGV2ZWwgPSByZXF1aXJlKCcuL2xldmVsJykuUG9wTGV2ZWw7XG5yZWYkID0gcmVxdWlyZSgnLi9jb25maWcnKSwgdGlsZVggPSByZWYkLnRpbGVYLCB0aWxlWSA9IHJlZiQudGlsZVksIHRpbGVzUGVyUm9vbSA9IHJlZiQudGlsZXNQZXJSb29tLCByb29tV2lkdGggPSByZWYkLnJvb21XaWR0aCwgcm9vbUhlaWdodCA9IHJlZiQucm9vbUhlaWdodDtcbmxldmVsRGF0YSA9IHt9O1xueGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xueGhyLm9wZW4oJ0dFVCcsIFwibGV2ZWxzLzA0LnBsdlwiLCB0cnVlKTtcbnhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xueGhyLnNlbmQoKTtcbnhoci5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICB2YXIgbWFpbkJsaXR0ZXIsIGdldFJvb21PZmZzZXRzLCBnZXRSb29tQ29vcmRzLCBkaXNjb3ZlclJvb21Qb3NpdGlvbnMsIHNvcnRCeURyYXdpbmdPcmRlciwgZHJhd1Jvb21XaXRoTmVpZ2hib3VycywgZHJhd05laWdoYm91ciwgZHJhd0FsbFJvb21zLCB1cGRhdGVSb29tUmVuZGVycywgcGFuLCBsYXN0TW91c2UsIGRyYWdnaW5nLCByb29tQ29vcmRzO1xuICBsZXZlbERhdGEgPSBuZXcgUG9wTGV2ZWwodGhpcy5yZXNwb25zZSwgUGFsYWNlKTtcbiAgbWFpbkJsaXR0ZXIgPSBuZXcgQmxpdHRlcih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgZ2V0Um9vbU9mZnNldHMgPSBmdW5jdGlvbihpdCl7XG4gICAgc3dpdGNoIChpdCkge1xuICAgIGNhc2UgJ3VwJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IHRpbGVZICogLXJvb21IZWlnaHRcbiAgICAgIH07XG4gICAgY2FzZSAnZG93bic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiB0aWxlWSAqIHJvb21IZWlnaHRcbiAgICAgIH07XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aWxlWCAqIC1yb29tV2lkdGgsXG4gICAgICAgIHk6IDBcbiAgICAgIH07XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGlsZVggKiByb29tV2lkdGgsXG4gICAgICAgIHk6IDBcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICBnZXRSb29tQ29vcmRzID0gZnVuY3Rpb24oZGlyLCBhcmckKXtcbiAgICB2YXIgeCwgeTtcbiAgICB4ID0gYXJnJC54LCB5ID0gYXJnJC55O1xuICAgIHN3aXRjaCAoZGlyKSB7XG4gICAgY2FzZSAndXAnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSAtIDFcbiAgICAgIH07XG4gICAgY2FzZSAnZG93bic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5ICsgMVxuICAgICAgfTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHggLSAxLFxuICAgICAgICB5OiB5XG4gICAgICB9O1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHggKyAxLFxuICAgICAgICB5OiB5XG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gY29uc29sZS5lcnJvcignV2hhdD8nKTtcbiAgICB9XG4gIH07XG4gIGRpc2NvdmVyUm9vbVBvc2l0aW9ucyA9IGZ1bmN0aW9uKHJvb20pe1xuICAgIHZhciBjb29yZHMsIGZldGNoVW5yZXNvbHZlZDtcbiAgICBjb29yZHMgPSBbXTtcbiAgICBjb29yZHNbcm9vbV0gPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH07XG4gICAgZmV0Y2hVbnJlc29sdmVkID0gZnVuY3Rpb24ocm9vbSl7XG4gICAgICB2YXIgbGlua3MsIGRpciwgaW5kZXgsIHJlc3VsdHMkID0gW107XG4gICAgICBsaW5rcyA9IGxldmVsRGF0YS5saW5rc1tyb29tXTtcbiAgICAgIGZvciAoZGlyIGluIGxpbmtzKSB7XG4gICAgICAgIGluZGV4ID0gbGlua3NbZGlyXTtcbiAgICAgICAgaWYgKCFjb29yZHNbaW5kZXhdKSB7XG4gICAgICAgICAgY29vcmRzW2luZGV4XSA9IGdldFJvb21Db29yZHMoZGlyLCBjb29yZHNbcm9vbV0pO1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goZmV0Y2hVbnJlc29sdmVkKGluZGV4KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9O1xuICAgIGZldGNoVW5yZXNvbHZlZChyb29tKTtcbiAgICByZXR1cm4gc29ydEJ5RHJhd2luZ09yZGVyKGNvb3Jkcyk7XG4gIH07XG4gIHNvcnRCeURyYXdpbmdPcmRlciA9IGZ1bmN0aW9uKHJhd0Nvb3Jkcyl7XG4gICAgdmFyIG5lYXRDb29yZHMsIHJlcyQsIGluZGV4LCByZWYkLCB4LCB5LCByb3dzO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGluZGV4IGluIHJhd0Nvb3Jkcykge1xuICAgICAgcmVmJCA9IHJhd0Nvb3Jkc1tpbmRleF0sIHggPSByZWYkLngsIHkgPSByZWYkLnk7XG4gICAgICByZXMkLnB1c2goe1xuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBuZWF0Q29vcmRzID0gcmVzJDtcbiAgICByb3dzID0gdmFsdWVzKGdyb3VwQnkoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lnk7XG4gICAgfSwgbmVhdENvb3JkcykpO1xuICAgIHJvd3Muc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBhWzBdLnkgPCBiWzBdLnk7XG4gICAgfSk7XG4gICAgcm93cy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhLnggPiBiLng7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcm93cztcbiAgfTtcbiAgZHJhd1Jvb21XaXRoTmVpZ2hib3VycyA9IGZ1bmN0aW9uKHJvb20sIG94LCBveSl7XG4gICAgdmFyIGxpbmtzO1xuICAgIGxpbmtzID0gbGV2ZWxEYXRhLmxpbmtzW3Jvb21dO1xuICAgIGRyYXdOZWlnaGJvdXIobGlua3MsICdkb3duJywgb3gsIG95KTtcbiAgICBkcmF3TmVpZ2hib3VyKGxpbmtzLCAnbGVmdCcsIG94LCBveSk7XG4gICAgbGV2ZWxEYXRhLnJvb21zW3Jvb21dLmJsaXRUbyhtYWluQmxpdHRlciwgb3gsIG95KTtcbiAgICBkcmF3TmVpZ2hib3VyKGxpbmtzLCAncmlnaHQnLCBveCwgb3kpO1xuICAgIHJldHVybiBkcmF3TmVpZ2hib3VyKGxpbmtzLCAndXAnLCBveCwgb3kpO1xuICB9O1xuICBkcmF3TmVpZ2hib3VyID0gZnVuY3Rpb24obGlua3MsIGRpciwgb3gsIG95KXtcbiAgICB2YXIgdGhhdCwgcmVmJCwgeCwgeTtcbiAgICBpZiAodGhhdCA9IGxpbmtzW2Rpcl0pIHtcbiAgICAgIHJlZiQgPSBnZXRSb29tT2Zmc2V0cyhkaXIpLCB4ID0gcmVmJC54LCB5ID0gcmVmJC55O1xuICAgICAgcmV0dXJuIGxldmVsRGF0YS5yb29tc1t0aGF0XS5ibGl0VG8obWFpbkJsaXR0ZXIsIG94ICsgeCwgb3kgKyB5KTtcbiAgICB9XG4gIH07XG4gIGRyYXdBbGxSb29tcyA9IGZ1bmN0aW9uKGNvb3JkUm93cywgcHgsIHB5KXtcbiAgICB2YXIgY3gsIGN5LCBpJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCByZWYkLCBpbmRleCwgeCwgeSwgcngsIHJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIG1haW5CbGl0dGVyLmNsZWFyKCk7XG4gICAgY3ggPSBmbG9vcigobWFpbkJsaXR0ZXIuY2FudmFzLndpZHRoIC0gdGlsZVggKiByb29tV2lkdGgpIC8gMik7XG4gICAgY3kgPSBmbG9vcigobWFpbkJsaXR0ZXIuY2FudmFzLmhlaWdodCAtIHRpbGVZICogcm9vbUhlaWdodCkgLyAyKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IGNvb3JkUm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93ID0gY29vcmRSb3dzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHJlZiQgPSByb3dbaiRdLCBpbmRleCA9IHJlZiQuaW5kZXgsIHggPSByZWYkLngsIHkgPSByZWYkLnk7XG4gICAgICAgIHJ4ID0gdGlsZVggKiByb29tV2lkdGggKiB4O1xuICAgICAgICByeSA9IHRpbGVZICogcm9vbUhlaWdodCAqIHk7XG4gICAgICAgIGxyZXN1bHQkLnB1c2gobGV2ZWxEYXRhLnJvb21zW2luZGV4XS5ibGl0VG8obWFpbkJsaXR0ZXIsIGN4ICsgcnggKyBweCwgY3kgKyByeSArIHB5KSk7XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICB1cGRhdGVSb29tUmVuZGVycyA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCByb29tLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBsZXZlbERhdGEucm9vbXMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICByb29tID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHJvb20ucmVuZGVyKCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHBhbiA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcbiAgbGFzdE1vdXNlID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuICBkcmFnZ2luZyA9IGZhbHNlO1xuICByb29tQ29vcmRzID0gZGlzY292ZXJSb29tUG9zaXRpb25zKGxldmVsRGF0YS5zdGFydC5yb29tKTtcbiAgbWFpbkJsaXR0ZXIub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRyYWdnaW5nID0gdHJ1ZTtcbiAgfSk7XG4gIG1haW5CbGl0dGVyLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSk7XG4gIG1haW5CbGl0dGVyLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCl7XG4gICAgdmFyIM6UeCwgzpR5O1xuICAgIM6UeCA9IGxhc3RNb3VzZS54IC0gZXZlbnQub2Zmc2V0WDtcbiAgICDOlHkgPSBsYXN0TW91c2UueSAtIGV2ZW50Lm9mZnNldFk7XG4gICAgbGFzdE1vdXNlLnggPSBldmVudC5vZmZzZXRYO1xuICAgIGxhc3RNb3VzZS55ID0gZXZlbnQub2Zmc2V0WTtcbiAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgIHBhbi54IC09IM6UeDtcbiAgICAgIHBhbi55IC09IM6UeTtcbiAgICAgIG1haW5CbGl0dGVyLmNsZWFyKCk7XG4gICAgICByZXR1cm4gZHJhd0FsbFJvb21zKHJvb21Db29yZHMsIHBhbi54LCBwYW4ueSk7XG4gICAgfVxuICB9KTtcbiAgbWFpbkJsaXR0ZXIuaW5zdGFsbChkb2N1bWVudC5ib2R5KTtcbiAgcmV0dXJuIGRlbGF5KDEwMDAsIGZ1bmN0aW9uKCl7XG4gICAgdXBkYXRlUm9vbVJlbmRlcnMoKTtcbiAgICByZXR1cm4gZHJhd0FsbFJvb21zKHJvb21Db29yZHMsIDAsIDApO1xuICB9KTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGxvYWRJbWcsIG51bGxTcHJpdGUsIGlzTm9uZSwgZ2V0dGVyLCBEdW5nZW9uLCBQYWxhY2UsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5sb2FkSW1nID0gZnVuY3Rpb24oc3JjKXtcbiAgdmFyIGk7XG4gIGkgPSBuZXcgSW1hZ2U7XG4gIGkuc3JjID0gJy90aWxlcy8nICsgc3JjICsgJy5wbmcnO1xuICByZXR1cm4gaTtcbn07XG5udWxsU3ByaXRlID0ge307XG5vdXQkLmlzTm9uZSA9IGlzTm9uZSA9IChmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA9PT0gbnVsbFNwcml0ZTtcbn0pO1xuZ2V0dGVyID0gZnVuY3Rpb24oc3ByaXRlcyl7XG4gIHJldHVybiB7XG4gICAgZ2V0OiBmdW5jdGlvbihpdCl7XG4gICAgICBzd2l0Y2ggKGl0Lm5hbWUpIHtcbiAgICAgIGNhc2UgXCJFbXB0eVwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5ibGFuaztcbiAgICAgIGNhc2UgXCJUb3JjaFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy50b3JjaDtcbiAgICAgIGNhc2UgXCJTcGlrZXNcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuc3Bpa2VzO1xuICAgICAgY2FzZSBcIldhbGxcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMud2FsbDtcbiAgICAgIGNhc2UgXCJGbG9vclwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5mbG9vcjtcbiAgICAgIGNhc2UgXCJQaWxsYXJcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMucGlsbGFyO1xuICAgICAgY2FzZSBcIkNob3BwZXJcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuY2hvcHBlcjtcbiAgICAgIGNhc2UgXCJEZWJyaXNcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuZGVicmlzO1xuICAgICAgY2FzZSBcIkxvb3NlIEJvYXJkXCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLnVuc3RhYmxlO1xuICAgICAgY2FzZSBcIkdhdGVcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuZ2F0ZTtcbiAgICAgIGNhc2UgXCJQb3Rpb25cIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMucmVkO1xuICAgICAgY2FzZSBcIlJhaXNlIEJ1dHRvblwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5wbGF0ZTtcbiAgICAgIGNhc2UgXCJEcm9wIEJ1dHRvblwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5zbGFtO1xuICAgICAgY2FzZSBcIkV4aXQgTGVmdFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5leGl0TGVmdDtcbiAgICAgIGNhc2UgXCJFeGl0IFJpZ2h0XCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLmV4aXRSaWdodDtcbiAgICAgIGNhc2UgXCJTa2VsZXRvblwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5za2VsZXRvbjtcbiAgICAgIGNhc2UgXCJTd29yZFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5zd29yZDtcbiAgICAgIGNhc2UgXCJUYXBlc3RyeSBUb3BcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMudGFwZXN0cnlUb3A7XG4gICAgICBjYXNlIFwiVG9wIEJpZy1waWxsYXJcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuY29sdW1uVG9wO1xuICAgICAgY2FzZSBcIkJvdHRvbSBCaWctcGlsbGFyXCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLmNvbHVtbkJ0bTtcbiAgICAgIGNhc2UgXCJMYXR0aWNlIFBpbGxhclwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5sYXR0aWNlUGlsbGFyO1xuICAgICAgY2FzZSBcIkxhdHRpY2UgU3VwcG9ydFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5sYXR0aWNlU3VwcG9ydDtcbiAgICAgIGNhc2UgXCJTbWFsbCBMYXR0aWNlXCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLmxhdHRpY2VTbWFsbDtcbiAgICAgIGNhc2UgXCJMYXR0aWNlIExlZnRcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMubGF0dGljZUxlZnQ7XG4gICAgICBjYXNlIFwiTGF0dGljZSBSaWdodFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5sYXR0aWNlUmlnaHQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsb2coaXQubmFtZSwgaXQuY29kZS50b1N0cmluZygxNikpO1xuICAgICAgICByZXR1cm4gbnVsbFNwcml0ZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xub3V0JC5EdW5nZW9uID0gRHVuZ2VvbiA9IGdldHRlcih7XG4gIGJsYW5rOiBuZXcgSW1hZ2UsXG4gIHdhbGw6IGxvYWRJbWcoJ2R1bmdlb24vd2FsbCcpLFxuICB0b3JjaDogbG9hZEltZygnZHVuZ2Vvbi90b3JjaCcpLFxuICBmbG9vcjogbG9hZEltZygnZHVuZ2Vvbi9mbG9vcicpLFxuICBwaWxsYXI6IGxvYWRJbWcoJ2R1bmdlb24vcGlsbGFycycpLFxuICBkZWJyaXM6IGxvYWRJbWcoJ2R1bmdlb24vZGVicmlzJyksXG4gIHVuc3RhYmxlOiBsb2FkSW1nKCdkdW5nZW9uL3Vuc3RhYmxlJyksXG4gIGdhdGU6IGxvYWRJbWcoJ2R1bmdlb24vZ2F0ZScpLFxuICBwbGF0ZTogbG9hZEltZygnZHVuZ2Vvbi9wbGF0ZScpLFxuICByZWQ6IGxvYWRJbWcoJ2R1bmdlb24vcG90aW9uLXJlZCcpLFxuICBzbGFtOiBsb2FkSW1nKCdkdW5nZW9uL3NsYW0nKSxcbiAgc3Bpa2VzOiBsb2FkSW1nKCdkdW5nZW9uL3NwaWtlcycpLFxuICBleGl0TGVmdDogbG9hZEltZygnZHVuZ2Vvbi9leGl0LWxlZnQnKSxcbiAgZXhpdFJpZ2h0OiBsb2FkSW1nKCdkdW5nZW9uL2V4aXQtcmlnaHQnKSxcbiAgc2tlbGV0b246IGxvYWRJbWcoJ2R1bmdlb24vc2tlbGV0b24nKSxcbiAgc3dvcmQ6IGxvYWRJbWcoJ2R1bmdlb24vc3dvcmQnKSxcbiAgY29sdW1uVG9wOiBsb2FkSW1nKCdkdW5nZW9uL2NvbHVtbnMtdG9wJyksXG4gIGNvbHVtbkJ0bTogbG9hZEltZygnZHVuZ2Vvbi9jb2x1bW5zLWJ0bScpLFxuICBjaG9wcGVyOiBsb2FkSW1nKCdkdW5nZW9uL2Nob3BwZXInKSxcbiAgdGFwZXN0cnlUb3A6IGxvYWRJbWcoJ2R1bmdlb24vdGFwZXN0cnktdG9wJylcbn0pO1xub3V0JC5QYWxhY2UgPSBQYWxhY2UgPSBnZXR0ZXIoe1xuICBibGFuazogbmV3IEltYWdlLFxuICB3YWxsOiBsb2FkSW1nKCdwYWxhY2Uvd2FsbCcpLFxuICB0b3JjaDogbG9hZEltZygncGFsYWNlL3RvcmNoJyksXG4gIGZsb29yOiBsb2FkSW1nKCdwYWxhY2UvZmxvb3InKSxcbiAgcGlsbGFyOiBsb2FkSW1nKCdwYWxhY2UvcGlsbGFycycpLFxuICBkZWJyaXM6IGxvYWRJbWcoJ3BhbGFjZS9kZWJyaXMnKSxcbiAgdW5zdGFibGU6IGxvYWRJbWcoJ3BhbGFjZS91bnN0YWJsZScpLFxuICBnYXRlOiBsb2FkSW1nKCdwYWxhY2UvZ2F0ZScpLFxuICBwbGF0ZTogbG9hZEltZygncGFsYWNlL3BsYXRlJyksXG4gIHJlZDogbG9hZEltZygncGFsYWNlL3BvdGlvbi1yZWQnKSxcbiAgc2xhbTogbG9hZEltZygncGFsYWNlL3NsYW0nKSxcbiAgc3Bpa2VzOiBsb2FkSW1nKCdwYWxhY2Uvc3Bpa2VzJyksXG4gIGV4aXRMZWZ0OiBsb2FkSW1nKCdwYWxhY2UvZXhpdC1sZWZ0JyksXG4gIGV4aXRSaWdodDogbG9hZEltZygncGFsYWNlL2V4aXQtcmlnaHQnKSxcbiAgY2hvcHBlcjogbG9hZEltZygncGFsYWNlL2Nob3BwZXInKSxcbiAgdGFwZXN0cnlUb3A6IGxvYWRJbWcoJ3BhbGFjZS90YXBlc3RyeS10b3AnKSxcbiAgbGF0dGljZVBpbGxhcjogbG9hZEltZygncGFsYWNlL2xhdHRpY2UtcGlsbGFyJyksXG4gIGxhdHRpY2VTdXBwb3J0OiBsb2FkSW1nKCdwYWxhY2UvbGF0dGljZS1zdXBwb3J0JyksXG4gIGxhdHRpY2VTbWFsbDogbG9hZEltZygncGFsYWNlL2xhdHRpY2Utc21hbGwnKSxcbiAgbGF0dGljZUxlZnQ6IGxvYWRJbWcoJ3BhbGFjZS9sYXR0aWNlLWxlZnQnKSxcbiAgbGF0dGljZVJpZ2h0OiBsb2FkSW1nKCdwYWxhY2UvbGF0dGljZS1yaWdodCcpXG59KTsiLCJ2YXIgQmxpdHRlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuQmxpdHRlciA9IEJsaXR0ZXIgPSAoZnVuY3Rpb24oKXtcbiAgQmxpdHRlci5kaXNwbGF5TmFtZSA9ICdCbGl0dGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEJsaXR0ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJsaXR0ZXI7XG4gIGZ1bmN0aW9uIEJsaXR0ZXIodywgaCl7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB3O1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGg7XG4gICAgdGhpcy5zZXREZWJ1Z0ZvbnQoKTtcbiAgfVxuICBwcm90b3R5cGUuZHJhd1dpdGggPSBmdW5jdGlvbijOuyl7XG4gICAgcmV0dXJuIM67LmNhbGwodGhpcy5jdHgsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgzrspe1xuICAgIHJldHVybiB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCDOuyk7XG4gIH07XG4gIHByb3RvdHlwZS5ibGl0VG8gPSBmdW5jdGlvbih0YXJnZXQsIHgsIHkpe1xuICAgIHJldHVybiB0YXJnZXQuY3R4LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLmluc3RhbGwgPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG4gIH07XG4gIHByb3RvdHlwZS5zZXREZWJ1Z0ZvbnQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHJldHVybiB0aGlzLmN0eC5mb250ID0gXCIxNnB4IG1vbm9zcGFjZVwiO1xuICB9O1xuICByZXR1cm4gQmxpdHRlcjtcbn0oKSk7IiwidmFyIHRpbGVYLCB0aWxlWSwgenosIHRpbGVPdmVybGFwLCByb29tV2lkdGgsIHJvb21IZWlnaHQsIHRpbGVzUGVyUm9vbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQudGlsZVggPSB0aWxlWCA9IDMyO1xub3V0JC50aWxlWSA9IHRpbGVZID0gNjM7XG5vdXQkLnp6ID0genogPSAxMDtcbm91dCQudGlsZU92ZXJsYXAgPSB0aWxlT3ZlcmxhcCA9IDE1O1xub3V0JC5yb29tV2lkdGggPSByb29tV2lkdGggPSAxMDtcbm91dCQucm9vbUhlaWdodCA9IHJvb21IZWlnaHQgPSAzO1xub3V0JC50aWxlc1BlclJvb20gPSB0aWxlc1BlclJvb20gPSByb29tV2lkdGggKiByb29tSGVpZ2h0OyIsInZhciBGb3JlVGlsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuRm9yZVRpbGUgPSBGb3JlVGlsZSA9IChmdW5jdGlvbigpe1xuICBGb3JlVGlsZS5kaXNwbGF5TmFtZSA9ICdGb3JlVGlsZSc7XG4gIHZhciBmb3JldGFibGVUaWxlVHlwZXMsIHByb3RvdHlwZSA9IEZvcmVUaWxlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGb3JlVGlsZTtcbiAgZm9yZXRhYmxlVGlsZVR5cGVzID0gW1xuICAgIHtcbiAgICAgIGNvZGU6IDB4MDAsXG4gICAgICBncm91cDogJ2ZyZWUnLFxuICAgICAgbmFtZTogXCJFbXB0eVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMSxcbiAgICAgIGdyb3VwOiAnZnJlZScsXG4gICAgICBuYW1lOiBcIkZsb29yXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDAyLFxuICAgICAgZ3JvdXA6ICdzcGlrZScsXG4gICAgICBuYW1lOiBcIlNwaWtlc1wiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwNCxcbiAgICAgIGdyb3VwOiAnZ2F0ZScsXG4gICAgICBuYW1lOiBcIkdhdGVcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDUsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTdHVjayBCdXR0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDYsXG4gICAgICBncm91cDogJ2V2ZW50JyxcbiAgICAgIG5hbWU6IFwiRHJvcCBCdXR0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDcsXG4gICAgICBncm91cDogJ3RhcGVzdCcsXG4gICAgICBuYW1lOiBcIlRhcGVzdHJ5XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA4LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiQm90dG9tIEJpZy1waWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDksXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJUb3AgQmlnLXBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwQSxcbiAgICAgIGdyb3VwOiAncG90aW9uJyxcbiAgICAgIG5hbWU6IFwiUG90aW9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBCLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTG9vc2UgQm9hcmRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEMsXG4gICAgICBncm91cDogJ3R0b3AnLFxuICAgICAgbmFtZTogXCJUYXBlc3RyeSBUb3BcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEQsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJNaXJyb3JcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEUsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJEZWJyaXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEYsXG4gICAgICBncm91cDogJ2V2ZW50JyxcbiAgICAgIG5hbWU6IFwiUmFpc2UgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDEwLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRXhpdCBMZWZ0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDExLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRXhpdCBSaWdodFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMixcbiAgICAgIGdyb3VwOiAnY2hvbXAnLFxuICAgICAgbmFtZTogXCJDaG9wcGVyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDEzLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9yY2hcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTQsXG4gICAgICBncm91cDogJ3dhbGwnLFxuICAgICAgbmFtZTogXCJXYWxsXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE1LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU2tlbGV0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTYsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTd29yZFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJhbGNvbnkgTGVmdFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxOCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJhbGNvbnkgUmlnaHRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTksXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxQSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxhdHRpY2UgU3VwcG9ydFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxQixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlNtYWxsIExhdHRpY2VcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUMsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIExlZnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUQsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFJpZ2h0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFFLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9yY2ggd2l0aCBEZWJyaXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUYsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJOdWxsXCJcbiAgICB9XG4gIF07XG4gIGZ1bmN0aW9uIEZvcmVUaWxlKGJ5dGUsIHgsIHkpe1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuYnl0ZSA9IGJ5dGU7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIGRhdGEgPSBmb3JldGFibGVUaWxlVHlwZXNbdGhpcy5ieXRlICYgMHgxRl07XG4gICAgaW1wb3J0JCh0aGlzLCBkYXRhKTtcbiAgICB0aGlzLm1vZGlmaWVkID0gKHRoaXMuYnl0ZSAmIDB4MjApID4+IDU7XG4gIH1cbiAgcmV0dXJuIEZvcmVUaWxlO1xufSgpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGRpdiwgUG9wUm9vbSwgUG9wTGV2ZWwsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGRpdiA9IHJlZiQuZGl2O1xuUG9wUm9vbSA9IHJlcXVpcmUoJy4vcm9vbScpLlBvcFJvb207XG5vdXQkLlBvcExldmVsID0gUG9wTGV2ZWwgPSAoZnVuY3Rpb24oKXtcbiAgUG9wTGV2ZWwuZGlzcGxheU5hbWUgPSAnUG9wTGV2ZWwnO1xuICB2YXIgUE9QX1JPT01fU0laRSwgUE9QX0xJTktfU0laRSwgUE9QX1BSRUFNQkxFX09GRlNFVCwgc3BlYywgRkFDSU5HLCBMSU5LSU5HLCBnZXRGYWNpbmcsIHNwZWNTbGljZSwgcHJvdG90eXBlID0gUG9wTGV2ZWwucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBvcExldmVsO1xuICBQT1BfUk9PTV9TSVpFID0gMzA7XG4gIFBPUF9MSU5LX1NJWkUgPSA0O1xuICBQT1BfUFJFQU1CTEVfT0ZGU0VUID0gMTg7XG4gIHNwZWMgPSB7XG4gICAgZm9yZXRhYmxlOiB7XG4gICAgICBvZmZzZXQ6IDAsXG4gICAgICBsZW5ndGg6IDcyMFxuICAgIH0sXG4gICAgYmFja3RhYmxlOiB7XG4gICAgICBvZmZzZXQ6IDcyMCxcbiAgICAgIGxlbmd0aDogNzIwXG4gICAgfSxcbiAgICBsaW5rczoge1xuICAgICAgb2Zmc2V0OiAxOTUyLFxuICAgICAgbGVuZ3RoOiA5NlxuICAgIH0sXG4gICAgZG9vckE6IHtcbiAgICAgIG9mZnNldDogMTQ0MCxcbiAgICAgIGxlbmd0aDogMjU2XG4gICAgfSxcbiAgICBkb29yQjoge1xuICAgICAgb2Zmc2V0OiAxNjk2LFxuICAgICAgbGVuZ3RoOiAyNTZcbiAgICB9LFxuICAgIHN0YXJ0UG9zaXRpb246IHtcbiAgICAgIG9mZnNldDogMjExMixcbiAgICAgIGxlbmd0aDogM1xuICAgIH0sXG4gICAgZ3VhcmRMb2NhdGlvbjoge1xuICAgICAgb2Zmc2V0OiAyMTE5LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgZ3VhcmREaXJlY3Rpb246IHtcbiAgICAgIG9mZnNldDogMjE0MyxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIGd1YXJkU2tpbGw6IHtcbiAgICAgIG9mZnNldDogMjIxNSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIGd1YXJkQ29sb3VyOiB7XG4gICAgICBvZmZzZXQ6IDIyNjMsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duMToge1xuICAgICAgb2Zmc2V0OiAyMDQ4LFxuICAgICAgbGVuZ3RoOiA2NFxuICAgIH0sXG4gICAgdW5rbm93bjI6IHtcbiAgICAgIG9mZnNldDogMjExNSxcbiAgICAgIGxlbmd0aDogM1xuICAgIH0sXG4gICAgdW5rbm93bjM6IHtcbiAgICAgIG9mZnNldDogMjExNixcbiAgICAgIGxlbmd0aDogMVxuICAgIH0sXG4gICAgdW5rbm93bjRhOiB7XG4gICAgICBvZmZzZXQ6IDIxNjcsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duNGI6IHtcbiAgICAgIG9mZnNldDogMjE5MSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIHVua25vd240Yzoge1xuICAgICAgb2Zmc2V0OiAyMjM5LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjRkOiB7XG4gICAgICBvZmZzZXQ6IDIyODcsXG4gICAgICBsZW5ndGg6IDE2XG4gICAgfSxcbiAgICBlbmQ6IHtcbiAgICAgIG9mZnNldDogMjMwMyxcbiAgICAgIGxlbmd0aDogMlxuICAgIH1cbiAgfTtcbiAgRkFDSU5HID0ge1xuICAgIExFRlQ6IFN5bWJvbChcIkZBQ0lOR19MRUZUXCIpLFxuICAgIFJJR0hUOiBTeW1ib2woXCJGQUNJTkdfUklHSFRcIiksXG4gICAgVU5LTk9XTjogU3ltYm9sKFwiRkFDSU5HX1VOS05PV05cIilcbiAgfTtcbiAgTElOS0lORyA9IHtcbiAgICBMRUZUOiAwLFxuICAgIFJJR0hUOiAxLFxuICAgIFVQOiAyLFxuICAgIERPV046IDNcbiAgfTtcbiAgZ2V0RmFjaW5nID0gZnVuY3Rpb24oKXtcbiAgICBzd2l0Y2ggKGZhbHNlKSB7XG4gICAgY2FzZSAhMDpcbiAgICAgIHJldHVybiBGQUNJTkcuTEVGVDtcbiAgICBjYXNlICEyNTU6XG4gICAgICByZXR1cm4gRkFDSU5HLlJJR0hUO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gRkFDSU5HLlVOS05PV047XG4gICAgfVxuICB9O1xuICBzcGVjU2xpY2UgPSBmdW5jdGlvbihidWZmZXIsIGNodW5rKXtcbiAgICByZXR1cm4gYnVmZmVyLnN1YmFycmF5KGNodW5rLm9mZnNldCwgY2h1bmsub2Zmc2V0ICsgY2h1bmsubGVuZ3RoKTtcbiAgfTtcbiAgZnVuY3Rpb24gUG9wTGV2ZWwocmF3LCBzcHJpdGVTZXQpe1xuICAgIGxvZyhcIm5ldyBQb3BMZXZlbFwiKTtcbiAgICB0aGlzLmZ1bGwgPSBuZXcgVWludDhBcnJheShyYXcpO1xuICAgIHRoaXMuZGF0YSA9IHRoaXMuZnVsbC5zdWJhcnJheShQT1BfUFJFQU1CTEVfT0ZGU0VUICsgMSwgdGhpcy5mdWxsLmxlbmd0aCAtIFBPUF9QUkVBTUJMRV9PRkZTRVQpO1xuICAgIHRoaXMucm9vbXMgPSB0aGlzLmV4dHJhY3RSb29tcyh0aGlzLmRhdGEsIHNwcml0ZVNldCk7XG4gICAgdGhpcy5saW5rcyA9IHRoaXMuZXh0cmFjdExpbmtzKHRoaXMuZGF0YSk7XG4gICAgdGhpcy5zdGFydCA9IHRoaXMuZXh0cmFjdFN0YXJ0KHRoaXMuZGF0YSk7XG4gIH1cbiAgcHJvdG90eXBlLmV4dHJhY3RSb29tcyA9IGZ1bmN0aW9uKGJ1ZmZlciwgc3ByaXRlU2V0KXtcbiAgICB2YXIgcm9vbXMsIHJlcyQsIGkkLCBpLCBzdGFydEluZGV4LCBlbmRJbmRleDtcbiAgICBsb2coJ3hyJywgc3ByaXRlU2V0LmdldCk7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSAyNDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgc3RhcnRJbmRleCA9IHNwZWMuZm9yZXRhYmxlLm9mZnNldCArIGkgKiBQT1BfUk9PTV9TSVpFO1xuICAgICAgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgUE9QX1JPT01fU0laRTtcbiAgICAgIHJlcyQucHVzaChuZXcgUG9wUm9vbSh7XG4gICAgICAgIGluZGV4OiBpICsgMSxcbiAgICAgICAgZm9yZWJ1ZmZlcjogYnVmZmVyLnN1YmFycmF5KHN0YXJ0SW5kZXgsIGVuZEluZGV4KSxcbiAgICAgICAgYmFja2J1ZmZlcjogbnVsbCxcbiAgICAgICAgc3ByaXRlU2V0OiBzcHJpdGVTZXRcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgcm9vbXMgPSByZXMkO1xuICAgIHJvb21zLnVuc2hpZnQoUG9wUm9vbS5OdWxsUm9vbSk7XG4gICAgcmV0dXJuIHJvb21zO1xuICB9O1xuICBwcm90b3R5cGUuZXh0cmFjdExpbmtzID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgICB2YXIgbGlua3MsIHJlcyQsIGkkLCBpLCBzdGFydEluZGV4LCBlbmRJbmRleCwgbGlua0RhdGE7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSAyNDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgc3RhcnRJbmRleCA9IHNwZWMubGlua3Mub2Zmc2V0ICsgaSAqIFBPUF9MSU5LX1NJWkU7XG4gICAgICBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBQT1BfTElOS19TSVpFO1xuICAgICAgbGlua0RhdGEgPSBidWZmZXIuc3ViYXJyYXkoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuICAgICAgcmVzJC5wdXNoKHtcbiAgICAgICAgdXA6IGxpbmtEYXRhW0xJTktJTkcuVVBdLFxuICAgICAgICBkb3duOiBsaW5rRGF0YVtMSU5LSU5HLkRPV05dLFxuICAgICAgICBsZWZ0OiBsaW5rRGF0YVtMSU5LSU5HLkxFRlRdLFxuICAgICAgICByaWdodDogbGlua0RhdGFbTElOS0lORy5SSUdIVF1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBsaW5rcyA9IHJlcyQ7XG4gICAgbGlua3MudW5zaGlmdCh7fSk7XG4gICAgcmV0dXJuIGxpbmtzO1xuICB9O1xuICBwcm90b3R5cGUuZXh0cmFjdFN0YXJ0ID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgICB2YXIgZGF0YTtcbiAgICBkYXRhID0gc3BlY1NsaWNlKGJ1ZmZlciwgc3BlYy5zdGFydFBvc2l0aW9uKTtcbiAgICByZXR1cm4ge1xuICAgICAgcm9vbTogZGF0YVswXSxcbiAgICAgIHRpbGU6IGRhdGFbMV0sXG4gICAgICBmYWNpbmc6IGdldEZhY2luZyhkYXRhWzJdKVxuICAgIH07XG4gIH07XG4gIHJldHVybiBQb3BMZXZlbDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIGRlbGF5LCBkaXYsIHRpbGVYLCB0aWxlWSwgdGlsZXNQZXJSb29tLCB0aWxlT3ZlcmxhcCwgcm9vbVdpZHRoLCByb29tSGVpZ2h0LCBpc05vbmUsIEJsaXR0ZXIsIEZvcmVUaWxlLCBQb3BSb29tLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXksIGRpdiA9IHJlZiQuZGl2O1xucmVmJCA9IHJlcXVpcmUoJy4uL2NvbmZpZycpLCB0aWxlWCA9IHJlZiQudGlsZVgsIHRpbGVZID0gcmVmJC50aWxlWSwgdGlsZXNQZXJSb29tID0gcmVmJC50aWxlc1BlclJvb20sIHRpbGVPdmVybGFwID0gcmVmJC50aWxlT3ZlcmxhcCwgcm9vbVdpZHRoID0gcmVmJC5yb29tV2lkdGgsIHJvb21IZWlnaHQgPSByZWYkLnJvb21IZWlnaHQ7XG5pc05vbmUgPSByZXF1aXJlKCcuLi9hc3NldHMnKS5pc05vbmU7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi4vYmxpdHRlcicpLkJsaXR0ZXI7XG5Gb3JlVGlsZSA9IHJlcXVpcmUoJy4vZm9yZXRpbGUnKS5Gb3JlVGlsZTtcbm91dCQuUG9wUm9vbSA9IFBvcFJvb20gPSAoZnVuY3Rpb24oKXtcbiAgUG9wUm9vbS5kaXNwbGF5TmFtZSA9ICdQb3BSb29tJztcbiAgdmFyIHByb3RvdHlwZSA9IFBvcFJvb20ucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBvcFJvb207XG4gIGZ1bmN0aW9uIFBvcFJvb20oYXJnJCl7XG4gICAgdmFyIGkkLCB0byQsIGksIHgsIHksIHRoaXMkID0gdGhpcztcbiAgICB0aGlzLmluZGV4ID0gYXJnJC5pbmRleCwgdGhpcy5mb3JlYnVmZmVyID0gYXJnJC5mb3JlYnVmZmVyLCB0aGlzLmJhY2tidWZmZXIgPSBhcmckLmJhY2tidWZmZXIsIHRoaXMuc3ByaXRlU2V0ID0gYXJnJC5zcHJpdGVTZXQ7XG4gICAgdGhpcy5ibGl0dGVyID0gbmV3IEJsaXR0ZXIodGlsZVggKiAocm9vbVdpZHRoICsgMSksIHRpbGVZICogcm9vbUhlaWdodCArIHRpbGVPdmVybGFwKTtcbiAgICB0aGlzLmZvcmV0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICB0aGlzLmJhY2t0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGlsZXNQZXJSb29tOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgeCA9IGkgJSByb29tV2lkdGg7XG4gICAgICB5ID0gZGl2KGksIHJvb21XaWR0aCk7XG4gICAgICB0aGlzLmZvcmV0aWxlc1t5XVt4XSA9IG5ldyBGb3JlVGlsZSh0aGlzLmZvcmVidWZmZXJbaV0sIHgsIHkpO1xuICAgIH1cbiAgICBkZWxheSgxMDAsIGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcyQucmVuZGVyKCk7XG4gICAgfSk7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRpbGVzLCBzcHJpdGVzO1xuICAgIHRpbGVzID0gdGhpcy5mb3JldGlsZXM7XG4gICAgc3ByaXRlcyA9IHRoaXMuc3ByaXRlU2V0O1xuICAgIHRoaXMuYmxpdHRlci5jbGVhcigpO1xuICAgIHJldHVybiB0aGlzLmJsaXR0ZXIuZHJhd1dpdGgoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpJCwgcm93SXgsIGxyZXN1bHQkLCByb3csIGokLCBsZW4kLCB0aWxlLCBpbWFnZSwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSAyOyBpJCA+PSAwOyAtLWkkKSB7XG4gICAgICAgIHJvd0l4ID0gaSQ7XG4gICAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICAgIHJvdyA9IHRpbGVzW3Jvd0l4XTtcbiAgICAgICAgZm9yIChqJCA9IDAsIGxlbiQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbiQ7ICsraiQpIHtcbiAgICAgICAgICB0aWxlID0gcm93W2okXTtcbiAgICAgICAgICBpbWFnZSA9IHNwcml0ZXMuZ2V0KHRpbGUpO1xuICAgICAgICAgIGlmIChpc05vbmUoaW1hZ2UpIHx8ICFpbWFnZSkge1xuICAgICAgICAgICAgdGhpcy5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICAgICAgdGhpcy5zdHJva2VUZXh0KHRpbGUuY29kZS50b1N0cmluZygxNiksIHRpbGUueCAqIHRpbGVYICsgdGlsZVgsIHRpbGUueSAqIHRpbGVZICsgdGlsZVkgKiAwLjcpO1xuICAgICAgICAgICAgdGhpcy5maWxsVGV4dCh0aWxlLmNvZGUudG9TdHJpbmcoMTYpLCB0aWxlLnggKiB0aWxlWCArIHRpbGVYLCB0aWxlLnkgKiB0aWxlWSArIHRpbGVZICogMC43KTtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2godm9pZCA4KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmRyYXdJbWFnZShpbWFnZSwgdGlsZS54ICogdGlsZVgsIHRpbGUueSAqIHRpbGVZKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0pO1xuICB9O1xuICBwcm90b3R5cGUuYmxpdFRvID0gZnVuY3Rpb24odGFyZ2V0LCB4LCB5KXtcbiAgICByZXR1cm4gdGFyZ2V0LmN0eC5kcmF3SW1hZ2UodGhpcy5ibGl0dGVyLmNhbnZhcywgeCwgeSk7XG4gIH07XG4gIFBvcFJvb20uTnVsbFJvb20gPSB7XG4gICAgcmVuZGVyOiBpZCxcbiAgICBibGl0VG86IGlkLFxuICAgIGluZGV4OiAwXG4gIH07XG4gIHJldHVybiBQb3BSb29tO1xufSgpKTsiLCJ2YXIgaWQsIGxvZywgbWluLCBtYXgsIGZsb29yLCByb3VuZCwgc2luLCBjb3MsIHRhdSwgZmxpcCwgZGVsYXksIGV2ZXJ5LCBkaXYsIHJhbmRvbSwgcmFuZG9tRnJvbSwgcmV2ZXJzZSwga2V5cywgdmFsdWVzLCBncm91cEJ5LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5pZCA9IGlkID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQ7XG59O1xub3V0JC5sb2cgPSBsb2cgPSBmdW5jdGlvbigpe1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gYXJndW1lbnRzWzBdO1xufTtcbm91dCQubWluID0gbWluID0gTWF0aC5taW47XG5vdXQkLm1heCA9IG1heCA9IE1hdGgubWF4O1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucm91bmQgPSByb3VuZCA9IE1hdGgucm91bmQ7XG5vdXQkLnNpbiA9IHNpbiA9IE1hdGguc2luO1xub3V0JC5jb3MgPSBjb3MgPSBNYXRoLmNvcztcbm91dCQudGF1ID0gdGF1ID0gTWF0aC5QSSAqIDI7XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmV2ZXJ5ID0gZXZlcnkgPSBmbGlwKHNldEludGVydmFsKTtcbm91dCQuZGl2ID0gZGl2ID0gY3VycnkkKGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gZmxvb3IoYSAvIGIpO1xufSk7XG5vdXQkLnJhbmRvbSA9IHJhbmRvbSA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiBpdDtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W2Zsb29yKHJhbmRvbShsaXN0Lmxlbmd0aCAtIDEpKV07XG59O1xub3V0JC5yZXZlcnNlID0gcmV2ZXJzZSA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0LnJldmVyc2UoKTtcbn07XG5vdXQkLmtleXMgPSBrZXlzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaywgdiwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChrIGluIGl0KSB7XG4gICAgdiA9IGl0W2tdO1xuICAgIHJlc3VsdHMkLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQudmFsdWVzID0gdmFsdWVzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaywgdiwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChrIGluIGl0KSB7XG4gICAgdiA9IGl0W2tdO1xuICAgIHJlc3VsdHMkLnB1c2godik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuZ3JvdXBCeSA9IGdyb3VwQnkgPSBmdW5jdGlvbijOuywgbGlzdCl7XG4gIHZhciBvLCBpJCwgbGVuJCwgeCwga2V5JDtcbiAgbyA9IHt9O1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IGxpc3QubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB4ID0gbGlzdFtpJF07XG4gICAgKG9ba2V5JCA9IM67KHgpXSB8fCAob1trZXkkXSA9IFtdKSkucHVzaCh4KTtcbiAgfVxuICByZXR1cm4gbztcbn07XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iXX0=
