(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, id, log, keys, floor, randomFrom, delay, every, groupBy, values, reverse, Dungeon, Blitter, PopLevel, tileX, tileY, tilesPerRoom, roomWidth, roomHeight, levelData, xhr;
ref$ = require('std'), id = ref$.id, log = ref$.log, keys = ref$.keys, floor = ref$.floor, randomFrom = ref$.randomFrom, delay = ref$.delay, every = ref$.every, groupBy = ref$.groupBy, values = ref$.values, reverse = ref$.reverse;
Dungeon = require('./assets').Dungeon;
Blitter = require('./blitter').Blitter;
PopLevel = require('./level').PopLevel;
ref$ = require('./config'), tileX = ref$.tileX, tileY = ref$.tileY, tilesPerRoom = ref$.tilesPerRoom, roomWidth = ref$.roomWidth, roomHeight = ref$.roomHeight;
levelData = {};
xhr = new XMLHttpRequest;
xhr.open('GET', "levels/04.plv", true);
xhr.responseType = 'arraybuffer';
xhr.send();
xhr.onload = function(){
  var mainBlitter, getRoomOffsets, getRoomCoords, discoverRoomPositions, sortByDrawingOrder, drawRoomWithNeighbours, drawNeighbour, drawAllRooms, pan, lastMouse, dragging, roomCoords;
  levelData = new PopLevel(this.response, Dungeon);
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
        if (index > 0) {
          if (!coords[index]) {
            coords[index] = getRoomCoords(dir, coords[room]);
            results$.push(fetchUnresolved(index));
          }
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
  return delay(100, function(){
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
      switch (it) {
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
      default:
        log(it);
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
out$.Palace = Palace = getter({});
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
    return this.blitter.drawWith(function(){
      var i$, rowIx, lresult$, row, j$, len$, tile, image, results$ = [];
      for (i$ = 2; i$ >= 0; --i$) {
        rowIx = i$;
        lresult$ = [];
        row = tiles[rowIx];
        for (j$ = 0, len$ = row.length; j$ < len$; ++j$) {
          tile = row[j$];
          image = sprites.get(tile.name);
          if (isNone(image)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2Fzc2V0cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2JsaXR0ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9jb25maWcubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9sZXZlbC9mb3JldGlsZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2xldmVsL2luZGV4LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbGV2ZWwvcm9vbS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL3N0ZC9pbmRleC5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgaWQsIGxvZywga2V5cywgZmxvb3IsIHJhbmRvbUZyb20sIGRlbGF5LCBldmVyeSwgZ3JvdXBCeSwgdmFsdWVzLCByZXZlcnNlLCBEdW5nZW9uLCBCbGl0dGVyLCBQb3BMZXZlbCwgdGlsZVgsIHRpbGVZLCB0aWxlc1BlclJvb20sIHJvb21XaWR0aCwgcm9vbUhlaWdodCwgbGV2ZWxEYXRhLCB4aHI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGtleXMgPSByZWYkLmtleXMsIGZsb29yID0gcmVmJC5mbG9vciwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbSwgZGVsYXkgPSByZWYkLmRlbGF5LCBldmVyeSA9IHJlZiQuZXZlcnksIGdyb3VwQnkgPSByZWYkLmdyb3VwQnksIHZhbHVlcyA9IHJlZiQudmFsdWVzLCByZXZlcnNlID0gcmVmJC5yZXZlcnNlO1xuRHVuZ2VvbiA9IHJlcXVpcmUoJy4vYXNzZXRzJykuRHVuZ2VvbjtcbkJsaXR0ZXIgPSByZXF1aXJlKCcuL2JsaXR0ZXInKS5CbGl0dGVyO1xuUG9wTGV2ZWwgPSByZXF1aXJlKCcuL2xldmVsJykuUG9wTGV2ZWw7XG5yZWYkID0gcmVxdWlyZSgnLi9jb25maWcnKSwgdGlsZVggPSByZWYkLnRpbGVYLCB0aWxlWSA9IHJlZiQudGlsZVksIHRpbGVzUGVyUm9vbSA9IHJlZiQudGlsZXNQZXJSb29tLCByb29tV2lkdGggPSByZWYkLnJvb21XaWR0aCwgcm9vbUhlaWdodCA9IHJlZiQucm9vbUhlaWdodDtcbmxldmVsRGF0YSA9IHt9O1xueGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xueGhyLm9wZW4oJ0dFVCcsIFwibGV2ZWxzLzA0LnBsdlwiLCB0cnVlKTtcbnhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xueGhyLnNlbmQoKTtcbnhoci5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICB2YXIgbWFpbkJsaXR0ZXIsIGdldFJvb21PZmZzZXRzLCBnZXRSb29tQ29vcmRzLCBkaXNjb3ZlclJvb21Qb3NpdGlvbnMsIHNvcnRCeURyYXdpbmdPcmRlciwgZHJhd1Jvb21XaXRoTmVpZ2hib3VycywgZHJhd05laWdoYm91ciwgZHJhd0FsbFJvb21zLCBwYW4sIGxhc3RNb3VzZSwgZHJhZ2dpbmcsIHJvb21Db29yZHM7XG4gIGxldmVsRGF0YSA9IG5ldyBQb3BMZXZlbCh0aGlzLnJlc3BvbnNlLCBEdW5nZW9uKTtcbiAgbWFpbkJsaXR0ZXIgPSBuZXcgQmxpdHRlcih3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgZ2V0Um9vbU9mZnNldHMgPSBmdW5jdGlvbihpdCl7XG4gICAgc3dpdGNoIChpdCkge1xuICAgIGNhc2UgJ3VwJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IHRpbGVZICogLXJvb21IZWlnaHRcbiAgICAgIH07XG4gICAgY2FzZSAnZG93bic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiB0aWxlWSAqIHJvb21IZWlnaHRcbiAgICAgIH07XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aWxlWCAqIC1yb29tV2lkdGgsXG4gICAgICAgIHk6IDBcbiAgICAgIH07XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGlsZVggKiByb29tV2lkdGgsXG4gICAgICAgIHk6IDBcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICBnZXRSb29tQ29vcmRzID0gZnVuY3Rpb24oZGlyLCBhcmckKXtcbiAgICB2YXIgeCwgeTtcbiAgICB4ID0gYXJnJC54LCB5ID0gYXJnJC55O1xuICAgIHN3aXRjaCAoZGlyKSB7XG4gICAgY2FzZSAndXAnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSAtIDFcbiAgICAgIH07XG4gICAgY2FzZSAnZG93bic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5ICsgMVxuICAgICAgfTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHggLSAxLFxuICAgICAgICB5OiB5XG4gICAgICB9O1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHggKyAxLFxuICAgICAgICB5OiB5XG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gY29uc29sZS5lcnJvcignV2hhdD8nKTtcbiAgICB9XG4gIH07XG4gIGRpc2NvdmVyUm9vbVBvc2l0aW9ucyA9IGZ1bmN0aW9uKHJvb20pe1xuICAgIHZhciBjb29yZHMsIGZldGNoVW5yZXNvbHZlZDtcbiAgICBjb29yZHMgPSBbXTtcbiAgICBjb29yZHNbcm9vbV0gPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMFxuICAgIH07XG4gICAgZmV0Y2hVbnJlc29sdmVkID0gZnVuY3Rpb24ocm9vbSl7XG4gICAgICB2YXIgbGlua3MsIGRpciwgaW5kZXgsIHJlc3VsdHMkID0gW107XG4gICAgICBsaW5rcyA9IGxldmVsRGF0YS5saW5rc1tyb29tXTtcbiAgICAgIGZvciAoZGlyIGluIGxpbmtzKSB7XG4gICAgICAgIGluZGV4ID0gbGlua3NbZGlyXTtcbiAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgIGlmICghY29vcmRzW2luZGV4XSkge1xuICAgICAgICAgICAgY29vcmRzW2luZGV4XSA9IGdldFJvb21Db29yZHMoZGlyLCBjb29yZHNbcm9vbV0pO1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaChmZXRjaFVucmVzb2x2ZWQoaW5kZXgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9O1xuICAgIGZldGNoVW5yZXNvbHZlZChyb29tKTtcbiAgICByZXR1cm4gc29ydEJ5RHJhd2luZ09yZGVyKGNvb3Jkcyk7XG4gIH07XG4gIHNvcnRCeURyYXdpbmdPcmRlciA9IGZ1bmN0aW9uKHJhd0Nvb3Jkcyl7XG4gICAgdmFyIG5lYXRDb29yZHMsIHJlcyQsIGluZGV4LCByZWYkLCB4LCB5LCByb3dzO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGluZGV4IGluIHJhd0Nvb3Jkcykge1xuICAgICAgcmVmJCA9IHJhd0Nvb3Jkc1tpbmRleF0sIHggPSByZWYkLngsIHkgPSByZWYkLnk7XG4gICAgICByZXMkLnB1c2goe1xuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBuZWF0Q29vcmRzID0gcmVzJDtcbiAgICByb3dzID0gdmFsdWVzKGdyb3VwQnkoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lnk7XG4gICAgfSwgbmVhdENvb3JkcykpO1xuICAgIHJvd3Muc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBhWzBdLnkgPCBiWzBdLnk7XG4gICAgfSk7XG4gICAgcm93cy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIHJldHVybiBhLnggPiBiLng7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcm93cztcbiAgfTtcbiAgZHJhd1Jvb21XaXRoTmVpZ2hib3VycyA9IGZ1bmN0aW9uKHJvb20sIG94LCBveSl7XG4gICAgdmFyIGxpbmtzO1xuICAgIGxpbmtzID0gbGV2ZWxEYXRhLmxpbmtzW3Jvb21dO1xuICAgIGRyYXdOZWlnaGJvdXIobGlua3MsICdkb3duJywgb3gsIG95KTtcbiAgICBkcmF3TmVpZ2hib3VyKGxpbmtzLCAnbGVmdCcsIG94LCBveSk7XG4gICAgbGV2ZWxEYXRhLnJvb21zW3Jvb21dLmJsaXRUbyhtYWluQmxpdHRlciwgb3gsIG95KTtcbiAgICBkcmF3TmVpZ2hib3VyKGxpbmtzLCAncmlnaHQnLCBveCwgb3kpO1xuICAgIHJldHVybiBkcmF3TmVpZ2hib3VyKGxpbmtzLCAndXAnLCBveCwgb3kpO1xuICB9O1xuICBkcmF3TmVpZ2hib3VyID0gZnVuY3Rpb24obGlua3MsIGRpciwgb3gsIG95KXtcbiAgICB2YXIgdGhhdCwgcmVmJCwgeCwgeTtcbiAgICBpZiAodGhhdCA9IGxpbmtzW2Rpcl0pIHtcbiAgICAgIHJlZiQgPSBnZXRSb29tT2Zmc2V0cyhkaXIpLCB4ID0gcmVmJC54LCB5ID0gcmVmJC55O1xuICAgICAgcmV0dXJuIGxldmVsRGF0YS5yb29tc1t0aGF0XS5ibGl0VG8obWFpbkJsaXR0ZXIsIG94ICsgeCwgb3kgKyB5KTtcbiAgICB9XG4gIH07XG4gIGRyYXdBbGxSb29tcyA9IGZ1bmN0aW9uKGNvb3JkUm93cywgcHgsIHB5KXtcbiAgICB2YXIgY3gsIGN5LCBpJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCByZWYkLCBpbmRleCwgeCwgeSwgcngsIHJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGN4ID0gZmxvb3IoKG1haW5CbGl0dGVyLmNhbnZhcy53aWR0aCAtIHRpbGVYICogcm9vbVdpZHRoKSAvIDIpO1xuICAgIGN5ID0gZmxvb3IoKG1haW5CbGl0dGVyLmNhbnZhcy5oZWlnaHQgLSB0aWxlWSAqIHJvb21IZWlnaHQpIC8gMik7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjb29yZFJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvdyA9IGNvb3JkUm93c1tpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICByZWYkID0gcm93W2okXSwgaW5kZXggPSByZWYkLmluZGV4LCB4ID0gcmVmJC54LCB5ID0gcmVmJC55O1xuICAgICAgICByeCA9IHRpbGVYICogcm9vbVdpZHRoICogeDtcbiAgICAgICAgcnkgPSB0aWxlWSAqIHJvb21IZWlnaHQgKiB5O1xuICAgICAgICBscmVzdWx0JC5wdXNoKGxldmVsRGF0YS5yb29tc1tpbmRleF0uYmxpdFRvKG1haW5CbGl0dGVyLCBjeCArIHJ4ICsgcHgsIGN5ICsgcnkgKyBweSkpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcGFuID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuICBsYXN0TW91c2UgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH07XG4gIGRyYWdnaW5nID0gZmFsc2U7XG4gIHJvb21Db29yZHMgPSBkaXNjb3ZlclJvb21Qb3NpdGlvbnMobGV2ZWxEYXRhLnN0YXJ0LnJvb20pO1xuICBtYWluQmxpdHRlci5vbignbW91c2Vkb3duJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZHJhZ2dpbmcgPSB0cnVlO1xuICB9KTtcbiAgbWFpbkJsaXR0ZXIub24oJ21vdXNldXAnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgbWFpbkJsaXR0ZXIub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICB2YXIgzpR4LCDOlHk7XG4gICAgzpR4ID0gbGFzdE1vdXNlLnggLSBldmVudC5vZmZzZXRYO1xuICAgIM6UeSA9IGxhc3RNb3VzZS55IC0gZXZlbnQub2Zmc2V0WTtcbiAgICBsYXN0TW91c2UueCA9IGV2ZW50Lm9mZnNldFg7XG4gICAgbGFzdE1vdXNlLnkgPSBldmVudC5vZmZzZXRZO1xuICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgcGFuLnggLT0gzpR4O1xuICAgICAgcGFuLnkgLT0gzpR5O1xuICAgICAgbWFpbkJsaXR0ZXIuY2xlYXIoKTtcbiAgICAgIHJldHVybiBkcmF3QWxsUm9vbXMocm9vbUNvb3JkcywgcGFuLngsIHBhbi55KTtcbiAgICB9XG4gIH0pO1xuICBtYWluQmxpdHRlci5pbnN0YWxsKGRvY3VtZW50LmJvZHkpO1xuICByZXR1cm4gZGVsYXkoMTAwLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmF3QWxsUm9vbXMocm9vbUNvb3JkcywgMCwgMCk7XG4gIH0pO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgbG9hZEltZywgbnVsbFNwcml0ZSwgaXNOb25lLCBnZXR0ZXIsIER1bmdlb24sIFBhbGFjZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbmxvYWRJbWcgPSBmdW5jdGlvbihzcmMpe1xuICB2YXIgaTtcbiAgaSA9IG5ldyBJbWFnZTtcbiAgaS5zcmMgPSAnL3RpbGVzLycgKyBzcmMgKyAnLnBuZyc7XG4gIHJldHVybiBpO1xufTtcbm51bGxTcHJpdGUgPSB7fTtcbm91dCQuaXNOb25lID0gaXNOb25lID0gKGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ID09PSBudWxsU3ByaXRlO1xufSk7XG5nZXR0ZXIgPSBmdW5jdGlvbihzcHJpdGVzKXtcbiAgcmV0dXJuIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKGl0KXtcbiAgICAgIHN3aXRjaCAoaXQpIHtcbiAgICAgIGNhc2UgXCJFbXB0eVwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5ibGFuaztcbiAgICAgIGNhc2UgXCJUb3JjaFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy50b3JjaDtcbiAgICAgIGNhc2UgXCJTcGlrZXNcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuc3Bpa2VzO1xuICAgICAgY2FzZSBcIldhbGxcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMud2FsbDtcbiAgICAgIGNhc2UgXCJGbG9vclwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5mbG9vcjtcbiAgICAgIGNhc2UgXCJQaWxsYXJcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMucGlsbGFyO1xuICAgICAgY2FzZSBcIkNob3BwZXJcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuY2hvcHBlcjtcbiAgICAgIGNhc2UgXCJEZWJyaXNcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuZGVicmlzO1xuICAgICAgY2FzZSBcIkxvb3NlIEJvYXJkXCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLnVuc3RhYmxlO1xuICAgICAgY2FzZSBcIkdhdGVcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuZ2F0ZTtcbiAgICAgIGNhc2UgXCJQb3Rpb25cIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMucmVkO1xuICAgICAgY2FzZSBcIlJhaXNlIEJ1dHRvblwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5wbGF0ZTtcbiAgICAgIGNhc2UgXCJEcm9wIEJ1dHRvblwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5zbGFtO1xuICAgICAgY2FzZSBcIkV4aXQgTGVmdFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5leGl0TGVmdDtcbiAgICAgIGNhc2UgXCJFeGl0IFJpZ2h0XCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLmV4aXRSaWdodDtcbiAgICAgIGNhc2UgXCJTa2VsZXRvblwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5za2VsZXRvbjtcbiAgICAgIGNhc2UgXCJTd29yZFwiOlxuICAgICAgICByZXR1cm4gc3ByaXRlcy5zd29yZDtcbiAgICAgIGNhc2UgXCJUYXBlc3RyeSBUb3BcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMudGFwZXN0cnlUb3A7XG4gICAgICBjYXNlIFwiVG9wIEJpZy1waWxsYXJcIjpcbiAgICAgICAgcmV0dXJuIHNwcml0ZXMuY29sdW1uVG9wO1xuICAgICAgY2FzZSBcIkJvdHRvbSBCaWctcGlsbGFyXCI6XG4gICAgICAgIHJldHVybiBzcHJpdGVzLmNvbHVtbkJ0bTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxvZyhpdCk7XG4gICAgICAgIHJldHVybiBudWxsU3ByaXRlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG5vdXQkLkR1bmdlb24gPSBEdW5nZW9uID0gZ2V0dGVyKHtcbiAgYmxhbms6IG5ldyBJbWFnZSxcbiAgd2FsbDogbG9hZEltZygnZHVuZ2Vvbi93YWxsJyksXG4gIHRvcmNoOiBsb2FkSW1nKCdkdW5nZW9uL3RvcmNoJyksXG4gIGZsb29yOiBsb2FkSW1nKCdkdW5nZW9uL2Zsb29yJyksXG4gIHBpbGxhcjogbG9hZEltZygnZHVuZ2Vvbi9waWxsYXJzJyksXG4gIGRlYnJpczogbG9hZEltZygnZHVuZ2Vvbi9kZWJyaXMnKSxcbiAgdW5zdGFibGU6IGxvYWRJbWcoJ2R1bmdlb24vdW5zdGFibGUnKSxcbiAgZ2F0ZTogbG9hZEltZygnZHVuZ2Vvbi9nYXRlJyksXG4gIHBsYXRlOiBsb2FkSW1nKCdkdW5nZW9uL3BsYXRlJyksXG4gIHJlZDogbG9hZEltZygnZHVuZ2Vvbi9wb3Rpb24tcmVkJyksXG4gIHNsYW06IGxvYWRJbWcoJ2R1bmdlb24vc2xhbScpLFxuICBzcGlrZXM6IGxvYWRJbWcoJ2R1bmdlb24vc3Bpa2VzJyksXG4gIGV4aXRMZWZ0OiBsb2FkSW1nKCdkdW5nZW9uL2V4aXQtbGVmdCcpLFxuICBleGl0UmlnaHQ6IGxvYWRJbWcoJ2R1bmdlb24vZXhpdC1yaWdodCcpLFxuICBza2VsZXRvbjogbG9hZEltZygnZHVuZ2Vvbi9za2VsZXRvbicpLFxuICBzd29yZDogbG9hZEltZygnZHVuZ2Vvbi9zd29yZCcpLFxuICBjb2x1bW5Ub3A6IGxvYWRJbWcoJ2R1bmdlb24vY29sdW1ucy10b3AnKSxcbiAgY29sdW1uQnRtOiBsb2FkSW1nKCdkdW5nZW9uL2NvbHVtbnMtYnRtJyksXG4gIGNob3BwZXI6IGxvYWRJbWcoJ2R1bmdlb24vY2hvcHBlcicpLFxuICB0YXBlc3RyeVRvcDogbG9hZEltZygnZHVuZ2Vvbi90YXBlc3RyeS10b3AnKVxufSk7XG5vdXQkLlBhbGFjZSA9IFBhbGFjZSA9IGdldHRlcih7fSk7IiwidmFyIEJsaXR0ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLkJsaXR0ZXIgPSBCbGl0dGVyID0gKGZ1bmN0aW9uKCl7XG4gIEJsaXR0ZXIuZGlzcGxheU5hbWUgPSAnQmxpdHRlcic7XG4gIHZhciBwcm90b3R5cGUgPSBCbGl0dGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCbGl0dGVyO1xuICBmdW5jdGlvbiBCbGl0dGVyKHcsIGgpe1xuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdztcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoO1xuICAgIHRoaXMuc2V0RGVidWdGb250KCk7XG4gIH1cbiAgcHJvdG90eXBlLmRyYXdXaXRoID0gZnVuY3Rpb24ozrspe1xuICAgIHJldHVybiDOuy5jYWxsKHRoaXMuY3R4LCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIM67KXtcbiAgICByZXR1cm4gdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgzrspO1xuICB9O1xuICBwcm90b3R5cGUuYmxpdFRvID0gZnVuY3Rpb24odGFyZ2V0LCB4LCB5KXtcbiAgICByZXR1cm4gdGFyZ2V0LmN0eC5kcmF3SW1hZ2UodGhpcy5jYW52YXMsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24oaG9zdCl7XG4gICAgcmV0dXJuIGhvc3QuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuICB9O1xuICBwcm90b3R5cGUuc2V0RGVidWdGb250ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICB0aGlzLmN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICByZXR1cm4gdGhpcy5jdHguZm9udCA9IFwiMTZweCBtb25vc3BhY2VcIjtcbiAgfTtcbiAgcmV0dXJuIEJsaXR0ZXI7XG59KCkpOyIsInZhciB0aWxlWCwgdGlsZVksIHp6LCB0aWxlT3ZlcmxhcCwgcm9vbVdpZHRoLCByb29tSGVpZ2h0LCB0aWxlc1BlclJvb20sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLnRpbGVYID0gdGlsZVggPSAzMjtcbm91dCQudGlsZVkgPSB0aWxlWSA9IDYzO1xub3V0JC56eiA9IHp6ID0gMTA7XG5vdXQkLnRpbGVPdmVybGFwID0gdGlsZU92ZXJsYXAgPSAxNTtcbm91dCQucm9vbVdpZHRoID0gcm9vbVdpZHRoID0gMTA7XG5vdXQkLnJvb21IZWlnaHQgPSByb29tSGVpZ2h0ID0gMztcbm91dCQudGlsZXNQZXJSb29tID0gdGlsZXNQZXJSb29tID0gcm9vbVdpZHRoICogcm9vbUhlaWdodDsiLCJ2YXIgRm9yZVRpbGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLkZvcmVUaWxlID0gRm9yZVRpbGUgPSAoZnVuY3Rpb24oKXtcbiAgRm9yZVRpbGUuZGlzcGxheU5hbWUgPSAnRm9yZVRpbGUnO1xuICB2YXIgZm9yZXRhYmxlVGlsZVR5cGVzLCBwcm90b3R5cGUgPSBGb3JlVGlsZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRm9yZVRpbGU7XG4gIGZvcmV0YWJsZVRpbGVUeXBlcyA9IFtcbiAgICB7XG4gICAgICBjb2RlOiAweDAwLFxuICAgICAgZ3JvdXA6ICdmcmVlJyxcbiAgICAgIG5hbWU6IFwiRW1wdHlcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDEsXG4gICAgICBncm91cDogJ2ZyZWUnLFxuICAgICAgbmFtZTogXCJGbG9vclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMixcbiAgICAgIGdyb3VwOiAnc3Bpa2UnLFxuICAgICAgbmFtZTogXCJTcGlrZXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDMsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJQaWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDQsXG4gICAgICBncm91cDogJ2dhdGUnLFxuICAgICAgbmFtZTogXCJHYXRlXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA1LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU3R1Y2sgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA2LFxuICAgICAgZ3JvdXA6ICdldmVudCcsXG4gICAgICBuYW1lOiBcIkRyb3AgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA3LFxuICAgICAgZ3JvdXA6ICd0YXBlc3QnLFxuICAgICAgbmFtZTogXCJUYXBlc3RyeVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwOCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJvdHRvbSBCaWctcGlsbGFyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA5LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9wIEJpZy1waWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEEsXG4gICAgICBncm91cDogJ3BvdGlvbicsXG4gICAgICBuYW1lOiBcIlBvdGlvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwQixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxvb3NlIEJvYXJkXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBDLFxuICAgICAgZ3JvdXA6ICd0dG9wJyxcbiAgICAgIG5hbWU6IFwiVGFwZXN0cnkgVG9wXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBELFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTWlycm9yXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBFLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRGVicmlzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBGLFxuICAgICAgZ3JvdXA6ICdldmVudCcsXG4gICAgICBuYW1lOiBcIlJhaXNlIEJ1dHRvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkV4aXQgTGVmdFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkV4aXQgUmlnaHRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTIsXG4gICAgICBncm91cDogJ2Nob21wJyxcbiAgICAgIG5hbWU6IFwiQ2hvcHBlclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcmNoXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE0LFxuICAgICAgZ3JvdXA6ICd3YWxsJyxcbiAgICAgIG5hbWU6IFwiV2FsbFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlNrZWxldG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE2LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU3dvcmRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTcsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCYWxjb255IExlZnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTgsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCYWxjb255IFJpZ2h0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE5LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBQaWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUEsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFN1cHBvcnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUIsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTbWFsbCBMYXR0aWNlXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFDLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBMZWZ0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFELFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBSaWdodFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxRSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcmNoIHdpdGggRGVicmlzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFGLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTnVsbFwiXG4gICAgfVxuICBdO1xuICBmdW5jdGlvbiBGb3JlVGlsZShieXRlLCB4LCB5KXtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLmJ5dGUgPSBieXRlO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICBkYXRhID0gZm9yZXRhYmxlVGlsZVR5cGVzW3RoaXMuYnl0ZSAmIDB4MUZdO1xuICAgIGltcG9ydCQodGhpcywgZGF0YSk7XG4gICAgdGhpcy5tb2RpZmllZCA9ICh0aGlzLmJ5dGUgJiAweDIwKSA+PiA1O1xuICB9XG4gIHJldHVybiBGb3JlVGlsZTtcbn0oKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBkaXYsIFBvcFJvb20sIFBvcExldmVsLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkaXYgPSByZWYkLmRpdjtcblBvcFJvb20gPSByZXF1aXJlKCcuL3Jvb20nKS5Qb3BSb29tO1xub3V0JC5Qb3BMZXZlbCA9IFBvcExldmVsID0gKGZ1bmN0aW9uKCl7XG4gIFBvcExldmVsLmRpc3BsYXlOYW1lID0gJ1BvcExldmVsJztcbiAgdmFyIFBPUF9ST09NX1NJWkUsIFBPUF9MSU5LX1NJWkUsIFBPUF9QUkVBTUJMRV9PRkZTRVQsIHNwZWMsIEZBQ0lORywgTElOS0lORywgZ2V0RmFjaW5nLCBzcGVjU2xpY2UsIHByb3RvdHlwZSA9IFBvcExldmVsLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQb3BMZXZlbDtcbiAgUE9QX1JPT01fU0laRSA9IDMwO1xuICBQT1BfTElOS19TSVpFID0gNDtcbiAgUE9QX1BSRUFNQkxFX09GRlNFVCA9IDE4O1xuICBzcGVjID0ge1xuICAgIGZvcmV0YWJsZToge1xuICAgICAgb2Zmc2V0OiAwLFxuICAgICAgbGVuZ3RoOiA3MjBcbiAgICB9LFxuICAgIGJhY2t0YWJsZToge1xuICAgICAgb2Zmc2V0OiA3MjAsXG4gICAgICBsZW5ndGg6IDcyMFxuICAgIH0sXG4gICAgbGlua3M6IHtcbiAgICAgIG9mZnNldDogMTk1MixcbiAgICAgIGxlbmd0aDogOTZcbiAgICB9LFxuICAgIGRvb3JBOiB7XG4gICAgICBvZmZzZXQ6IDE0NDAsXG4gICAgICBsZW5ndGg6IDI1NlxuICAgIH0sXG4gICAgZG9vckI6IHtcbiAgICAgIG9mZnNldDogMTY5NixcbiAgICAgIGxlbmd0aDogMjU2XG4gICAgfSxcbiAgICBzdGFydFBvc2l0aW9uOiB7XG4gICAgICBvZmZzZXQ6IDIxMTIsXG4gICAgICBsZW5ndGg6IDNcbiAgICB9LFxuICAgIGd1YXJkTG9jYXRpb246IHtcbiAgICAgIG9mZnNldDogMjExOSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIGd1YXJkRGlyZWN0aW9uOiB7XG4gICAgICBvZmZzZXQ6IDIxNDMsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICBndWFyZFNraWxsOiB7XG4gICAgICBvZmZzZXQ6IDIyMTUsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICBndWFyZENvbG91cjoge1xuICAgICAgb2Zmc2V0OiAyMjYzLFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjE6IHtcbiAgICAgIG9mZnNldDogMjA0OCxcbiAgICAgIGxlbmd0aDogNjRcbiAgICB9LFxuICAgIHVua25vd24yOiB7XG4gICAgICBvZmZzZXQ6IDIxMTUsXG4gICAgICBsZW5ndGg6IDNcbiAgICB9LFxuICAgIHVua25vd24zOiB7XG4gICAgICBvZmZzZXQ6IDIxMTYsXG4gICAgICBsZW5ndGg6IDFcbiAgICB9LFxuICAgIHVua25vd240YToge1xuICAgICAgb2Zmc2V0OiAyMTY3LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjRiOiB7XG4gICAgICBvZmZzZXQ6IDIxOTEsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duNGM6IHtcbiAgICAgIG9mZnNldDogMjIzOSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIHVua25vd240ZDoge1xuICAgICAgb2Zmc2V0OiAyMjg3LFxuICAgICAgbGVuZ3RoOiAxNlxuICAgIH0sXG4gICAgZW5kOiB7XG4gICAgICBvZmZzZXQ6IDIzMDMsXG4gICAgICBsZW5ndGg6IDJcbiAgICB9XG4gIH07XG4gIEZBQ0lORyA9IHtcbiAgICBMRUZUOiBTeW1ib2woXCJGQUNJTkdfTEVGVFwiKSxcbiAgICBSSUdIVDogU3ltYm9sKFwiRkFDSU5HX1JJR0hUXCIpLFxuICAgIFVOS05PV046IFN5bWJvbChcIkZBQ0lOR19VTktOT1dOXCIpXG4gIH07XG4gIExJTktJTkcgPSB7XG4gICAgTEVGVDogMCxcbiAgICBSSUdIVDogMSxcbiAgICBVUDogMixcbiAgICBET1dOOiAzXG4gIH07XG4gIGdldEZhY2luZyA9IGZ1bmN0aW9uKCl7XG4gICAgc3dpdGNoIChmYWxzZSkge1xuICAgIGNhc2UgITA6XG4gICAgICByZXR1cm4gRkFDSU5HLkxFRlQ7XG4gICAgY2FzZSAhMjU1OlxuICAgICAgcmV0dXJuIEZBQ0lORy5SSUdIVDtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIEZBQ0lORy5VTktOT1dOO1xuICAgIH1cbiAgfTtcbiAgc3BlY1NsaWNlID0gZnVuY3Rpb24oYnVmZmVyLCBjaHVuayl7XG4gICAgcmV0dXJuIGJ1ZmZlci5zdWJhcnJheShjaHVuay5vZmZzZXQsIGNodW5rLm9mZnNldCArIGNodW5rLmxlbmd0aCk7XG4gIH07XG4gIGZ1bmN0aW9uIFBvcExldmVsKHJhdywgc3ByaXRlU2V0KXtcbiAgICBsb2coXCJuZXcgUG9wTGV2ZWxcIik7XG4gICAgdGhpcy5mdWxsID0gbmV3IFVpbnQ4QXJyYXkocmF3KTtcbiAgICB0aGlzLmRhdGEgPSB0aGlzLmZ1bGwuc3ViYXJyYXkoUE9QX1BSRUFNQkxFX09GRlNFVCArIDEsIHRoaXMuZnVsbC5sZW5ndGggLSBQT1BfUFJFQU1CTEVfT0ZGU0VUKTtcbiAgICB0aGlzLnJvb21zID0gdGhpcy5leHRyYWN0Um9vbXModGhpcy5kYXRhLCBzcHJpdGVTZXQpO1xuICAgIHRoaXMubGlua3MgPSB0aGlzLmV4dHJhY3RMaW5rcyh0aGlzLmRhdGEpO1xuICAgIHRoaXMuc3RhcnQgPSB0aGlzLmV4dHJhY3RTdGFydCh0aGlzLmRhdGEpO1xuICB9XG4gIHByb3RvdHlwZS5leHRyYWN0Um9vbXMgPSBmdW5jdGlvbihidWZmZXIsIHNwcml0ZVNldCl7XG4gICAgdmFyIHJvb21zLCByZXMkLCBpJCwgaSwgc3RhcnRJbmRleCwgZW5kSW5kZXg7XG4gICAgbG9nKCd4cicsIHNwcml0ZVNldC5nZXQpO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMjQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHN0YXJ0SW5kZXggPSBzcGVjLmZvcmV0YWJsZS5vZmZzZXQgKyBpICogUE9QX1JPT01fU0laRTtcbiAgICAgIGVuZEluZGV4ID0gc3RhcnRJbmRleCArIFBPUF9ST09NX1NJWkU7XG4gICAgICByZXMkLnB1c2gobmV3IFBvcFJvb20oe1xuICAgICAgICBpbmRleDogaSArIDEsXG4gICAgICAgIGZvcmVidWZmZXI6IGJ1ZmZlci5zdWJhcnJheShzdGFydEluZGV4LCBlbmRJbmRleCksXG4gICAgICAgIGJhY2tidWZmZXI6IG51bGwsXG4gICAgICAgIHNwcml0ZVNldDogc3ByaXRlU2V0XG4gICAgICB9KSk7XG4gICAgfVxuICAgIHJvb21zID0gcmVzJDtcbiAgICByb29tcy51bnNoaWZ0KFBvcFJvb20uTnVsbFJvb20pO1xuICAgIHJldHVybiByb29tcztcbiAgfTtcbiAgcHJvdG90eXBlLmV4dHJhY3RMaW5rcyA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIGxpbmtzLCByZXMkLCBpJCwgaSwgc3RhcnRJbmRleCwgZW5kSW5kZXgsIGxpbmtEYXRhO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMjQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHN0YXJ0SW5kZXggPSBzcGVjLmxpbmtzLm9mZnNldCArIGkgKiBQT1BfTElOS19TSVpFO1xuICAgICAgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgUE9QX0xJTktfU0laRTtcbiAgICAgIGxpbmtEYXRhID0gYnVmZmVyLnN1YmFycmF5KHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcbiAgICAgIHJlcyQucHVzaCh7XG4gICAgICAgIHVwOiBsaW5rRGF0YVtMSU5LSU5HLlVQXSxcbiAgICAgICAgZG93bjogbGlua0RhdGFbTElOS0lORy5ET1dOXSxcbiAgICAgICAgbGVmdDogbGlua0RhdGFbTElOS0lORy5MRUZUXSxcbiAgICAgICAgcmlnaHQ6IGxpbmtEYXRhW0xJTktJTkcuUklHSFRdXG4gICAgICB9KTtcbiAgICB9XG4gICAgbGlua3MgPSByZXMkO1xuICAgIGxpbmtzLnVuc2hpZnQoe30pO1xuICAgIHJldHVybiBsaW5rcztcbiAgfTtcbiAgcHJvdG90eXBlLmV4dHJhY3RTdGFydCA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIGRhdGE7XG4gICAgZGF0YSA9IHNwZWNTbGljZShidWZmZXIsIHNwZWMuc3RhcnRQb3NpdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb206IGRhdGFbMF0sXG4gICAgICB0aWxlOiBkYXRhWzFdLFxuICAgICAgZmFjaW5nOiBnZXRGYWNpbmcoZGF0YVsyXSlcbiAgICB9O1xuICB9O1xuICByZXR1cm4gUG9wTGV2ZWw7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBkZWxheSwgZGl2LCB0aWxlWCwgdGlsZVksIHRpbGVzUGVyUm9vbSwgdGlsZU92ZXJsYXAsIHJvb21XaWR0aCwgcm9vbUhlaWdodCwgaXNOb25lLCBCbGl0dGVyLCBGb3JlVGlsZSwgUG9wUm9vbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZGVsYXkgPSByZWYkLmRlbGF5LCBkaXYgPSByZWYkLmRpdjtcbnJlZiQgPSByZXF1aXJlKCcuLi9jb25maWcnKSwgdGlsZVggPSByZWYkLnRpbGVYLCB0aWxlWSA9IHJlZiQudGlsZVksIHRpbGVzUGVyUm9vbSA9IHJlZiQudGlsZXNQZXJSb29tLCB0aWxlT3ZlcmxhcCA9IHJlZiQudGlsZU92ZXJsYXAsIHJvb21XaWR0aCA9IHJlZiQucm9vbVdpZHRoLCByb29tSGVpZ2h0ID0gcmVmJC5yb29tSGVpZ2h0O1xuaXNOb25lID0gcmVxdWlyZSgnLi4vYXNzZXRzJykuaXNOb25lO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4uL2JsaXR0ZXInKS5CbGl0dGVyO1xuRm9yZVRpbGUgPSByZXF1aXJlKCcuL2ZvcmV0aWxlJykuRm9yZVRpbGU7XG5vdXQkLlBvcFJvb20gPSBQb3BSb29tID0gKGZ1bmN0aW9uKCl7XG4gIFBvcFJvb20uZGlzcGxheU5hbWUgPSAnUG9wUm9vbSc7XG4gIHZhciBwcm90b3R5cGUgPSBQb3BSb29tLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQb3BSb29tO1xuICBmdW5jdGlvbiBQb3BSb29tKGFyZyQpe1xuICAgIHZhciBpJCwgdG8kLCBpLCB4LCB5LCB0aGlzJCA9IHRoaXM7XG4gICAgdGhpcy5pbmRleCA9IGFyZyQuaW5kZXgsIHRoaXMuZm9yZWJ1ZmZlciA9IGFyZyQuZm9yZWJ1ZmZlciwgdGhpcy5iYWNrYnVmZmVyID0gYXJnJC5iYWNrYnVmZmVyLCB0aGlzLnNwcml0ZVNldCA9IGFyZyQuc3ByaXRlU2V0O1xuICAgIHRoaXMuYmxpdHRlciA9IG5ldyBCbGl0dGVyKHRpbGVYICogKHJvb21XaWR0aCArIDEpLCB0aWxlWSAqIHJvb21IZWlnaHQgKyB0aWxlT3ZlcmxhcCk7XG4gICAgdGhpcy5mb3JldGlsZXMgPSBbW10sIFtdLCBbXV07XG4gICAgdGhpcy5iYWNrdGlsZXMgPSBbW10sIFtdLCBbXV07XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRpbGVzUGVyUm9vbTsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHggPSBpICUgcm9vbVdpZHRoO1xuICAgICAgeSA9IGRpdihpLCByb29tV2lkdGgpO1xuICAgICAgdGhpcy5mb3JldGlsZXNbeV1beF0gPSBuZXcgRm9yZVRpbGUodGhpcy5mb3JlYnVmZmVyW2ldLCB4LCB5KTtcbiAgICB9XG4gICAgZGVsYXkoMTAwLCBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMkLnJlbmRlcigpO1xuICAgIH0pO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0aWxlcywgc3ByaXRlcztcbiAgICB0aWxlcyA9IHRoaXMuZm9yZXRpbGVzO1xuICAgIHNwcml0ZXMgPSB0aGlzLnNwcml0ZVNldDtcbiAgICByZXR1cm4gdGhpcy5ibGl0dGVyLmRyYXdXaXRoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaSQsIHJvd0l4LCBscmVzdWx0JCwgcm93LCBqJCwgbGVuJCwgdGlsZSwgaW1hZ2UsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMjsgaSQgPj0gMDsgLS1pJCkge1xuICAgICAgICByb3dJeCA9IGkkO1xuICAgICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgICByb3cgPSB0aWxlc1tyb3dJeF07XG4gICAgICAgIGZvciAoaiQgPSAwLCBsZW4kID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4kOyArK2okKSB7XG4gICAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgICAgaW1hZ2UgPSBzcHJpdGVzLmdldCh0aWxlLm5hbWUpO1xuICAgICAgICAgIGlmIChpc05vbmUoaW1hZ2UpKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgICAgICB0aGlzLnN0cm9rZVRleHQodGlsZS5jb2RlLnRvU3RyaW5nKDE2KSwgdGlsZS54ICogdGlsZVggKyB0aWxlWCwgdGlsZS55ICogdGlsZVkgKyB0aWxlWSAqIDAuNyk7XG4gICAgICAgICAgICB0aGlzLmZpbGxUZXh0KHRpbGUuY29kZS50b1N0cmluZygxNiksIHRpbGUueCAqIHRpbGVYICsgdGlsZVgsIHRpbGUueSAqIHRpbGVZICsgdGlsZVkgKiAwLjcpO1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCh2b2lkIDgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuZHJhd0ltYWdlKGltYWdlLCB0aWxlLnggKiB0aWxlWCwgdGlsZS55ICogdGlsZVkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfSk7XG4gIH07XG4gIHByb3RvdHlwZS5ibGl0VG8gPSBmdW5jdGlvbih0YXJnZXQsIHgsIHkpe1xuICAgIHJldHVybiB0YXJnZXQuY3R4LmRyYXdJbWFnZSh0aGlzLmJsaXR0ZXIuY2FudmFzLCB4LCB5KTtcbiAgfTtcbiAgcmV0dXJuIFBvcFJvb207XG59KCkpOyIsInZhciBpZCwgbG9nLCBtaW4sIG1heCwgZmxvb3IsIHJvdW5kLCBzaW4sIGNvcywgdGF1LCBmbGlwLCBkZWxheSwgZXZlcnksIGRpdiwgcmFuZG9tLCByYW5kb21Gcm9tLCByZXZlcnNlLCBrZXlzLCB2YWx1ZXMsIGdyb3VwQnksIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5taW4gPSBtaW4gPSBNYXRoLm1pbjtcbm91dCQubWF4ID0gbWF4ID0gTWF0aC5tYXg7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yb3VuZCA9IHJvdW5kID0gTWF0aC5yb3VuZDtcbm91dCQuc2luID0gc2luID0gTWF0aC5zaW47XG5vdXQkLmNvcyA9IGNvcyA9IE1hdGguY29zO1xub3V0JC50YXUgPSB0YXUgPSBNYXRoLlBJICogMjtcbm91dCQuZmxpcCA9IGZsaXAgPSBmdW5jdGlvbijOuyl7XG4gIHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gzrsoYiwgYSk7XG4gIH07XG59O1xub3V0JC5kZWxheSA9IGRlbGF5ID0gZmxpcChzZXRUaW1lb3V0KTtcbm91dCQuZXZlcnkgPSBldmVyeSA9IGZsaXAoc2V0SW50ZXJ2YWwpO1xub3V0JC5kaXYgPSBkaXYgPSBjdXJyeSQoZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBmbG9vcihhIC8gYik7XG59KTtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIGl0O1xufTtcbm91dCQucmFuZG9tRnJvbSA9IHJhbmRvbUZyb20gPSBmdW5jdGlvbihsaXN0KXtcbiAgcmV0dXJuIGxpc3RbZmxvb3IocmFuZG9tKGxpc3QubGVuZ3RoIC0gMSkpXTtcbn07XG5vdXQkLnJldmVyc2UgPSByZXZlcnNlID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQucmV2ZXJzZSgpO1xufTtcbm91dCQua2V5cyA9IGtleXMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBrLCB2LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGsgaW4gaXQpIHtcbiAgICB2ID0gaXRba107XG4gICAgcmVzdWx0cyQucHVzaChrKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC52YWx1ZXMgPSB2YWx1ZXMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBrLCB2LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGsgaW4gaXQpIHtcbiAgICB2ID0gaXRba107XG4gICAgcmVzdWx0cyQucHVzaCh2KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC5ncm91cEJ5ID0gZ3JvdXBCeSA9IGZ1bmN0aW9uKM67LCBsaXN0KXtcbiAgdmFyIG8sIGkkLCBsZW4kLCB4LCBrZXkkO1xuICBvID0ge307XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbGlzdC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsaXN0W2kkXTtcbiAgICAob1trZXkkID0gzrsoeCldIHx8IChvW2tleSRdID0gW10pKS5wdXNoKHgpO1xuICB9XG4gIHJldHVybiBvO1xufTtcbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSJdfQ==
