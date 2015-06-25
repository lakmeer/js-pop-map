(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, id, log, keys, randomFrom, delay, every, groupBy, values, reverse, Assets, Blitter, PopLevel, tileX, tileY, tilesPerRoom, roomWidth, roomHeight, levelData, xhr;
ref$ = require('std'), id = ref$.id, log = ref$.log, keys = ref$.keys, randomFrom = ref$.randomFrom, delay = ref$.delay, every = ref$.every, groupBy = ref$.groupBy, values = ref$.values, reverse = ref$.reverse;
Assets = require('./assets').Assets;
Blitter = require('./blitter').Blitter;
PopLevel = require('./level').PopLevel;
ref$ = require('./config'), tileX = ref$.tileX, tileY = ref$.tileY, tilesPerRoom = ref$.tilesPerRoom, roomWidth = ref$.roomWidth, roomHeight = ref$.roomHeight;
levelData = {};
xhr = new XMLHttpRequest;
xhr.open('GET', "levels/02.plv", true);
xhr.responseType = 'arraybuffer';
xhr.send();
xhr.onload = function(){
  var mainBlitter, getRoomOffsets, getRoomCoords, discoverRoomPositions, sortByDrawingOrder, drawRoomWithNeighbours, drawNeighbour, drawAllRooms, pan, lastMouse, dragging, roomCoords;
  levelData = new PopLevel(this.response);
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
    var i$, len$, row, lresult$, j$, len1$, ref$, index, x, y, rx, ry, results$ = [];
    for (i$ = 0, len$ = coordRows.length; i$ < len$; ++i$) {
      row = coordRows[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        ref$ = row[j$], index = ref$.index, x = ref$.x, y = ref$.y;
        rx = tileX * roomWidth * x;
        ry = tileY * roomHeight * y;
        lresult$.push(levelData.rooms[index].blitTo(mainBlitter, rx + px, ry + py));
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
var ref$, id, log, loadImg, sprites, Assets, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
loadImg = function(src){
  var i;
  i = new Image;
  i.src = '/tiles/' + src + '.png';
  return i;
};
sprites = {
  'null': new Image,
  blank: new Image,
  wall: loadImg('wall'),
  torch: loadImg('torch'),
  floor: loadImg('floor'),
  pillar: loadImg('pillars'),
  debris: loadImg('debris'),
  unstable: loadImg('unstable'),
  gate: loadImg('gate'),
  plate: loadImg('plate'),
  red: loadImg('potion-red'),
  slam: loadImg('slam'),
  spikes: loadImg('spikes'),
  exitLeft: loadImg('exit-left'),
  exitRight: loadImg('exit-right'),
  skeleton: loadImg('skeleton'),
  sword: loadImg('sword')
};
out$.Assets = Assets = {
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
    default:
      return sprites['null'];
    }
  },
  isNone: function(asset){
    return asset === sprites['null'];
  }
};
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
  function PopLevel(raw){
    log("new PopLevel");
    this.full = new Uint8Array(raw);
    this.data = this.full.subarray(POP_PREAMBLE_OFFSET + 1, this.full.length - POP_PREAMBLE_OFFSET);
    this.rooms = this.extractRooms(this.data);
    this.links = this.extractLinks(this.data);
    this.start = this.extractStart(this.data);
  }
  prototype.extractRooms = function(buffer){
    var rooms, res$, i$, i, startIndex, endIndex;
    res$ = [];
    for (i$ = 0; i$ <= 24; ++i$) {
      i = i$;
      startIndex = spec.foretable.offset + i * POP_ROOM_SIZE;
      endIndex = startIndex + POP_ROOM_SIZE;
      res$.push(new PopRoom(i + 1, buffer.subarray(startIndex, endIndex)));
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
var ref$, id, log, delay, div, tileX, tileY, tilesPerRoom, tileOverlap, roomWidth, roomHeight, Assets, Blitter, ForeTile, PopRoom, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, delay = ref$.delay, div = ref$.div;
ref$ = require('../config'), tileX = ref$.tileX, tileY = ref$.tileY, tilesPerRoom = ref$.tilesPerRoom, tileOverlap = ref$.tileOverlap, roomWidth = ref$.roomWidth, roomHeight = ref$.roomHeight;
Assets = require('../assets').Assets;
Blitter = require('../blitter').Blitter;
ForeTile = require('./foretile').ForeTile;
out$.PopRoom = PopRoom = (function(){
  PopRoom.displayName = 'PopRoom';
  var prototype = PopRoom.prototype, constructor = PopRoom;
  function PopRoom(index, forebuffer, backbuffer){
    var i$, to$, i, x, y, this$ = this;
    this.index = index;
    this.forebuffer = forebuffer;
    this.backbuffer = backbuffer;
    this.foretiles = [[], [], []];
    this.backtiles = [[], [], []];
    this.blitter = new Blitter(tileX * (roomWidth + 1), tileY * roomHeight + tileOverlap);
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
    var tiles;
    tiles = this.foretiles;
    return this.blitter.drawWith(function(){
      var i$, rowIx, lresult$, row, j$, len$, tile, image, results$ = [];
      for (i$ = 2; i$ >= 0; --i$) {
        rowIx = i$;
        lresult$ = [];
        row = tiles[rowIx];
        for (j$ = 0, len$ = row.length; j$ < len$; ++j$) {
          tile = row[j$];
          image = Assets.get(tile.name);
          if (Assets.isNone(image)) {
            lresult$.push(void 8);
          } else if (image) {
            lresult$.push(this.drawImage(image, tile.x * tileX, tile.y * tileY));
          } else {
            this.fillStyle = 'white';
            this.strokeText(tile.code.toString(16), tile.x * tileX + tileX, tile.y * tileY + tileY * 0.7);
            lresult$.push(this.fillText(tile.code.toString(16), tile.x * tileX + tileX, tile.y * tileY + tileY * 0.7));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2Fzc2V0cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2JsaXR0ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9jb25maWcubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9sZXZlbC9mb3JldGlsZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2xldmVsL2luZGV4LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbGV2ZWwvcm9vbS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL3N0ZC9pbmRleC5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlZiQsIGlkLCBsb2csIGtleXMsIHJhbmRvbUZyb20sIGRlbGF5LCBldmVyeSwgZ3JvdXBCeSwgdmFsdWVzLCByZXZlcnNlLCBBc3NldHMsIEJsaXR0ZXIsIFBvcExldmVsLCB0aWxlWCwgdGlsZVksIHRpbGVzUGVyUm9vbSwgcm9vbVdpZHRoLCByb29tSGVpZ2h0LCBsZXZlbERhdGEsIHhocjtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywga2V5cyA9IHJlZiQua2V5cywgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbSwgZGVsYXkgPSByZWYkLmRlbGF5LCBldmVyeSA9IHJlZiQuZXZlcnksIGdyb3VwQnkgPSByZWYkLmdyb3VwQnksIHZhbHVlcyA9IHJlZiQudmFsdWVzLCByZXZlcnNlID0gcmVmJC5yZXZlcnNlO1xuQXNzZXRzID0gcmVxdWlyZSgnLi9hc3NldHMnKS5Bc3NldHM7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi9ibGl0dGVyJykuQmxpdHRlcjtcblBvcExldmVsID0gcmVxdWlyZSgnLi9sZXZlbCcpLlBvcExldmVsO1xucmVmJCA9IHJlcXVpcmUoJy4vY29uZmlnJyksIHRpbGVYID0gcmVmJC50aWxlWCwgdGlsZVkgPSByZWYkLnRpbGVZLCB0aWxlc1BlclJvb20gPSByZWYkLnRpbGVzUGVyUm9vbSwgcm9vbVdpZHRoID0gcmVmJC5yb29tV2lkdGgsIHJvb21IZWlnaHQgPSByZWYkLnJvb21IZWlnaHQ7XG5sZXZlbERhdGEgPSB7fTtcbnhociA9IG5ldyBYTUxIdHRwUmVxdWVzdDtcbnhoci5vcGVuKCdHRVQnLCBcImxldmVscy8wMi5wbHZcIiwgdHJ1ZSk7XG54aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbnhoci5zZW5kKCk7XG54aHIub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgdmFyIG1haW5CbGl0dGVyLCBnZXRSb29tT2Zmc2V0cywgZ2V0Um9vbUNvb3JkcywgZGlzY292ZXJSb29tUG9zaXRpb25zLCBzb3J0QnlEcmF3aW5nT3JkZXIsIGRyYXdSb29tV2l0aE5laWdoYm91cnMsIGRyYXdOZWlnaGJvdXIsIGRyYXdBbGxSb29tcywgcGFuLCBsYXN0TW91c2UsIGRyYWdnaW5nLCByb29tQ29vcmRzO1xuICBsZXZlbERhdGEgPSBuZXcgUG9wTGV2ZWwodGhpcy5yZXNwb25zZSk7XG4gIG1haW5CbGl0dGVyID0gbmV3IEJsaXR0ZXIod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gIGdldFJvb21PZmZzZXRzID0gZnVuY3Rpb24oaXQpe1xuICAgIHN3aXRjaCAoaXQpIHtcbiAgICBjYXNlICd1cCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiB0aWxlWSAqIC1yb29tSGVpZ2h0XG4gICAgICB9O1xuICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogdGlsZVkgKiByb29tSGVpZ2h0XG4gICAgICB9O1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGlsZVggKiAtcm9vbVdpZHRoLFxuICAgICAgICB5OiAwXG4gICAgICB9O1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRpbGVYICogcm9vbVdpZHRoLFxuICAgICAgICB5OiAwXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbiAgZ2V0Um9vbUNvb3JkcyA9IGZ1bmN0aW9uKGRpciwgYXJnJCl7XG4gICAgdmFyIHgsIHk7XG4gICAgeCA9IGFyZyQueCwgeSA9IGFyZyQueTtcbiAgICBzd2l0Y2ggKGRpcikge1xuICAgIGNhc2UgJ3VwJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHkgLSAxXG4gICAgICB9O1xuICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSArIDFcbiAgICAgIH07XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4IC0gMSxcbiAgICAgICAgeTogeVxuICAgICAgfTtcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4ICsgMSxcbiAgICAgICAgeTogeVxuICAgICAgfTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoJ1doYXQ/Jyk7XG4gICAgfVxuICB9O1xuICBkaXNjb3ZlclJvb21Qb3NpdGlvbnMgPSBmdW5jdGlvbihyb29tKXtcbiAgICB2YXIgY29vcmRzLCBmZXRjaFVucmVzb2x2ZWQ7XG4gICAgY29vcmRzID0gW107XG4gICAgY29vcmRzW3Jvb21dID0ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDBcbiAgICB9O1xuICAgIGZldGNoVW5yZXNvbHZlZCA9IGZ1bmN0aW9uKHJvb20pe1xuICAgICAgdmFyIGxpbmtzLCBkaXIsIGluZGV4LCByZXN1bHRzJCA9IFtdO1xuICAgICAgbGlua3MgPSBsZXZlbERhdGEubGlua3Nbcm9vbV07XG4gICAgICBmb3IgKGRpciBpbiBsaW5rcykge1xuICAgICAgICBpbmRleCA9IGxpbmtzW2Rpcl07XG4gICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICBpZiAoIWNvb3Jkc1tpbmRleF0pIHtcbiAgICAgICAgICAgIGNvb3Jkc1tpbmRleF0gPSBnZXRSb29tQ29vcmRzKGRpciwgY29vcmRzW3Jvb21dKTtcbiAgICAgICAgICAgIHJlc3VsdHMkLnB1c2goZmV0Y2hVbnJlc29sdmVkKGluZGV4KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfTtcbiAgICBmZXRjaFVucmVzb2x2ZWQocm9vbSk7XG4gICAgcmV0dXJuIHNvcnRCeURyYXdpbmdPcmRlcihjb29yZHMpO1xuICB9O1xuICBzb3J0QnlEcmF3aW5nT3JkZXIgPSBmdW5jdGlvbihyYXdDb29yZHMpe1xuICAgIHZhciBuZWF0Q29vcmRzLCByZXMkLCBpbmRleCwgcmVmJCwgeCwgeSwgcm93cztcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpbmRleCBpbiByYXdDb29yZHMpIHtcbiAgICAgIHJlZiQgPSByYXdDb29yZHNbaW5kZXhdLCB4ID0gcmVmJC54LCB5ID0gcmVmJC55O1xuICAgICAgcmVzJC5wdXNoKHtcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5XG4gICAgICB9KTtcbiAgICB9XG4gICAgbmVhdENvb3JkcyA9IHJlcyQ7XG4gICAgcm93cyA9IHZhbHVlcyhncm91cEJ5KGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC55O1xuICAgIH0sIG5lYXRDb29yZHMpKTtcbiAgICByb3dzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gYVswXS55IDwgYlswXS55O1xuICAgIH0pO1xuICAgIHJvd3MubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICByZXR1cm4gYS54ID4gYi54O1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJvd3M7XG4gIH07XG4gIGRyYXdSb29tV2l0aE5laWdoYm91cnMgPSBmdW5jdGlvbihyb29tLCBveCwgb3kpe1xuICAgIHZhciBsaW5rcztcbiAgICBsaW5rcyA9IGxldmVsRGF0YS5saW5rc1tyb29tXTtcbiAgICBkcmF3TmVpZ2hib3VyKGxpbmtzLCAnZG93bicsIG94LCBveSk7XG4gICAgZHJhd05laWdoYm91cihsaW5rcywgJ2xlZnQnLCBveCwgb3kpO1xuICAgIGxldmVsRGF0YS5yb29tc1tyb29tXS5ibGl0VG8obWFpbkJsaXR0ZXIsIG94LCBveSk7XG4gICAgZHJhd05laWdoYm91cihsaW5rcywgJ3JpZ2h0Jywgb3gsIG95KTtcbiAgICByZXR1cm4gZHJhd05laWdoYm91cihsaW5rcywgJ3VwJywgb3gsIG95KTtcbiAgfTtcbiAgZHJhd05laWdoYm91ciA9IGZ1bmN0aW9uKGxpbmtzLCBkaXIsIG94LCBveSl7XG4gICAgdmFyIHRoYXQsIHJlZiQsIHgsIHk7XG4gICAgaWYgKHRoYXQgPSBsaW5rc1tkaXJdKSB7XG4gICAgICByZWYkID0gZ2V0Um9vbU9mZnNldHMoZGlyKSwgeCA9IHJlZiQueCwgeSA9IHJlZiQueTtcbiAgICAgIHJldHVybiBsZXZlbERhdGEucm9vbXNbdGhhdF0uYmxpdFRvKG1haW5CbGl0dGVyLCBveCArIHgsIG95ICsgeSk7XG4gICAgfVxuICB9O1xuICBkcmF3QWxsUm9vbXMgPSBmdW5jdGlvbihjb29yZFJvd3MsIHB4LCBweSl7XG4gICAgdmFyIGkkLCBsZW4kLCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHJlZiQsIGluZGV4LCB4LCB5LCByeCwgcnksIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjb29yZFJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvdyA9IGNvb3JkUm93c1tpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICByZWYkID0gcm93W2okXSwgaW5kZXggPSByZWYkLmluZGV4LCB4ID0gcmVmJC54LCB5ID0gcmVmJC55O1xuICAgICAgICByeCA9IHRpbGVYICogcm9vbVdpZHRoICogeDtcbiAgICAgICAgcnkgPSB0aWxlWSAqIHJvb21IZWlnaHQgKiB5O1xuICAgICAgICBscmVzdWx0JC5wdXNoKGxldmVsRGF0YS5yb29tc1tpbmRleF0uYmxpdFRvKG1haW5CbGl0dGVyLCByeCArIHB4LCByeSArIHB5KSk7XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwYW4gPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH07XG4gIGxhc3RNb3VzZSA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcbiAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgcm9vbUNvb3JkcyA9IGRpc2NvdmVyUm9vbVBvc2l0aW9ucyhsZXZlbERhdGEuc3RhcnQucm9vbSk7XG4gIG1haW5CbGl0dGVyLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmFnZ2luZyA9IHRydWU7XG4gIH0pO1xuICBtYWluQmxpdHRlci5vbignbW91c2V1cCcsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRyYWdnaW5nID0gZmFsc2U7XG4gIH0pO1xuICBtYWluQmxpdHRlci5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIHZhciDOlHgsIM6UeTtcbiAgICDOlHggPSBsYXN0TW91c2UueCAtIGV2ZW50Lm9mZnNldFg7XG4gICAgzpR5ID0gbGFzdE1vdXNlLnkgLSBldmVudC5vZmZzZXRZO1xuICAgIGxhc3RNb3VzZS54ID0gZXZlbnQub2Zmc2V0WDtcbiAgICBsYXN0TW91c2UueSA9IGV2ZW50Lm9mZnNldFk7XG4gICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICBwYW4ueCAtPSDOlHg7XG4gICAgICBwYW4ueSAtPSDOlHk7XG4gICAgICBtYWluQmxpdHRlci5jbGVhcigpO1xuICAgICAgcmV0dXJuIGRyYXdBbGxSb29tcyhyb29tQ29vcmRzLCBwYW4ueCwgcGFuLnkpO1xuICAgIH1cbiAgfSk7XG4gIG1haW5CbGl0dGVyLmluc3RhbGwoZG9jdW1lbnQuYm9keSk7XG4gIHJldHVybiBkZWxheSgxMDAsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRyYXdBbGxSb29tcyhyb29tQ29vcmRzLCAwLCAwKTtcbiAgfSk7XG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBsb2FkSW1nLCBzcHJpdGVzLCBBc3NldHMsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5sb2FkSW1nID0gZnVuY3Rpb24oc3JjKXtcbiAgdmFyIGk7XG4gIGkgPSBuZXcgSW1hZ2U7XG4gIGkuc3JjID0gJy90aWxlcy8nICsgc3JjICsgJy5wbmcnO1xuICByZXR1cm4gaTtcbn07XG5zcHJpdGVzID0ge1xuICAnbnVsbCc6IG5ldyBJbWFnZSxcbiAgYmxhbms6IG5ldyBJbWFnZSxcbiAgd2FsbDogbG9hZEltZygnd2FsbCcpLFxuICB0b3JjaDogbG9hZEltZygndG9yY2gnKSxcbiAgZmxvb3I6IGxvYWRJbWcoJ2Zsb29yJyksXG4gIHBpbGxhcjogbG9hZEltZygncGlsbGFycycpLFxuICBkZWJyaXM6IGxvYWRJbWcoJ2RlYnJpcycpLFxuICB1bnN0YWJsZTogbG9hZEltZygndW5zdGFibGUnKSxcbiAgZ2F0ZTogbG9hZEltZygnZ2F0ZScpLFxuICBwbGF0ZTogbG9hZEltZygncGxhdGUnKSxcbiAgcmVkOiBsb2FkSW1nKCdwb3Rpb24tcmVkJyksXG4gIHNsYW06IGxvYWRJbWcoJ3NsYW0nKSxcbiAgc3Bpa2VzOiBsb2FkSW1nKCdzcGlrZXMnKSxcbiAgZXhpdExlZnQ6IGxvYWRJbWcoJ2V4aXQtbGVmdCcpLFxuICBleGl0UmlnaHQ6IGxvYWRJbWcoJ2V4aXQtcmlnaHQnKSxcbiAgc2tlbGV0b246IGxvYWRJbWcoJ3NrZWxldG9uJyksXG4gIHN3b3JkOiBsb2FkSW1nKCdzd29yZCcpXG59O1xub3V0JC5Bc3NldHMgPSBBc3NldHMgPSB7XG4gIGdldDogZnVuY3Rpb24oaXQpe1xuICAgIHN3aXRjaCAoaXQpIHtcbiAgICBjYXNlIFwiRW1wdHlcIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLmJsYW5rO1xuICAgIGNhc2UgXCJUb3JjaFwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMudG9yY2g7XG4gICAgY2FzZSBcIlNwaWtlc1wiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuc3Bpa2VzO1xuICAgIGNhc2UgXCJXYWxsXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy53YWxsO1xuICAgIGNhc2UgXCJGbG9vclwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuZmxvb3I7XG4gICAgY2FzZSBcIlBpbGxhclwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMucGlsbGFyO1xuICAgIGNhc2UgXCJEZWJyaXNcIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLmRlYnJpcztcbiAgICBjYXNlIFwiTG9vc2UgQm9hcmRcIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLnVuc3RhYmxlO1xuICAgIGNhc2UgXCJHYXRlXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5nYXRlO1xuICAgIGNhc2UgXCJQb3Rpb25cIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLnJlZDtcbiAgICBjYXNlIFwiUmFpc2UgQnV0dG9uXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5wbGF0ZTtcbiAgICBjYXNlIFwiRHJvcCBCdXR0b25cIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLnNsYW07XG4gICAgY2FzZSBcIkV4aXQgTGVmdFwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuZXhpdExlZnQ7XG4gICAgY2FzZSBcIkV4aXQgUmlnaHRcIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLmV4aXRSaWdodDtcbiAgICBjYXNlIFwiU2tlbGV0b25cIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLnNrZWxldG9uO1xuICAgIGNhc2UgXCJTd29yZFwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuc3dvcmQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzcHJpdGVzWydudWxsJ107XG4gICAgfVxuICB9LFxuICBpc05vbmU6IGZ1bmN0aW9uKGFzc2V0KXtcbiAgICByZXR1cm4gYXNzZXQgPT09IHNwcml0ZXNbJ251bGwnXTtcbiAgfVxufTsiLCJ2YXIgQmxpdHRlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuQmxpdHRlciA9IEJsaXR0ZXIgPSAoZnVuY3Rpb24oKXtcbiAgQmxpdHRlci5kaXNwbGF5TmFtZSA9ICdCbGl0dGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEJsaXR0ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJsaXR0ZXI7XG4gIGZ1bmN0aW9uIEJsaXR0ZXIodywgaCl7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB3O1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IGg7XG4gICAgdGhpcy5zZXREZWJ1Z0ZvbnQoKTtcbiAgfVxuICBwcm90b3R5cGUuZHJhd1dpdGggPSBmdW5jdGlvbijOuyl7XG4gICAgcmV0dXJuIM67LmNhbGwodGhpcy5jdHgsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgzrspe1xuICAgIHJldHVybiB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCDOuyk7XG4gIH07XG4gIHByb3RvdHlwZS5ibGl0VG8gPSBmdW5jdGlvbih0YXJnZXQsIHgsIHkpe1xuICAgIHJldHVybiB0YXJnZXQuY3R4LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLmluc3RhbGwgPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG4gIH07XG4gIHByb3RvdHlwZS5zZXREZWJ1Z0ZvbnQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgIHRoaXMuY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHJldHVybiB0aGlzLmN0eC5mb250ID0gXCIxNnB4IG1vbm9zcGFjZVwiO1xuICB9O1xuICByZXR1cm4gQmxpdHRlcjtcbn0oKSk7IiwidmFyIHRpbGVYLCB0aWxlWSwgenosIHRpbGVPdmVybGFwLCByb29tV2lkdGgsIHJvb21IZWlnaHQsIHRpbGVzUGVyUm9vbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQudGlsZVggPSB0aWxlWCA9IDMyO1xub3V0JC50aWxlWSA9IHRpbGVZID0gNjM7XG5vdXQkLnp6ID0genogPSAxMDtcbm91dCQudGlsZU92ZXJsYXAgPSB0aWxlT3ZlcmxhcCA9IDE1O1xub3V0JC5yb29tV2lkdGggPSByb29tV2lkdGggPSAxMDtcbm91dCQucm9vbUhlaWdodCA9IHJvb21IZWlnaHQgPSAzO1xub3V0JC50aWxlc1BlclJvb20gPSB0aWxlc1BlclJvb20gPSByb29tV2lkdGggKiByb29tSGVpZ2h0OyIsInZhciBGb3JlVGlsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuRm9yZVRpbGUgPSBGb3JlVGlsZSA9IChmdW5jdGlvbigpe1xuICBGb3JlVGlsZS5kaXNwbGF5TmFtZSA9ICdGb3JlVGlsZSc7XG4gIHZhciBmb3JldGFibGVUaWxlVHlwZXMsIHByb3RvdHlwZSA9IEZvcmVUaWxlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGb3JlVGlsZTtcbiAgZm9yZXRhYmxlVGlsZVR5cGVzID0gW1xuICAgIHtcbiAgICAgIGNvZGU6IDB4MDAsXG4gICAgICBncm91cDogJ2ZyZWUnLFxuICAgICAgbmFtZTogXCJFbXB0eVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMSxcbiAgICAgIGdyb3VwOiAnZnJlZScsXG4gICAgICBuYW1lOiBcIkZsb29yXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDAyLFxuICAgICAgZ3JvdXA6ICdzcGlrZScsXG4gICAgICBuYW1lOiBcIlNwaWtlc1wiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwNCxcbiAgICAgIGdyb3VwOiAnZ2F0ZScsXG4gICAgICBuYW1lOiBcIkdhdGVcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDUsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTdHVjayBCdXR0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDYsXG4gICAgICBncm91cDogJ2V2ZW50JyxcbiAgICAgIG5hbWU6IFwiRHJvcCBCdXR0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDcsXG4gICAgICBncm91cDogJ3RhcGVzdCcsXG4gICAgICBuYW1lOiBcIlRhcGVzdHJ5XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA4LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiQm90dG9tIEJpZy1waWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDksXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJUb3AgQmlnLXBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwQSxcbiAgICAgIGdyb3VwOiAncG90aW9uJyxcbiAgICAgIG5hbWU6IFwiUG90aW9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBCLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTG9vc2UgQm9hcmRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEMsXG4gICAgICBncm91cDogJ3R0b3AnLFxuICAgICAgbmFtZTogXCJUYXBlc3RyeSBUb3BcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEQsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJNaXJyb3JcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEUsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJEZWJyaXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEYsXG4gICAgICBncm91cDogJ2V2ZW50JyxcbiAgICAgIG5hbWU6IFwiUmFpc2UgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDEwLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRXhpdCBMZWZ0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDExLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRXhpdCBSaWdodFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMixcbiAgICAgIGdyb3VwOiAnY2hvbXAnLFxuICAgICAgbmFtZTogXCJDaG9wcGVyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDEzLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9yY2hcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTQsXG4gICAgICBncm91cDogJ3dhbGwnLFxuICAgICAgbmFtZTogXCJXYWxsXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE1LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU2tlbGV0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTYsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTd29yZFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJhbGNvbnkgTGVmdFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxOCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJhbGNvbnkgUmlnaHRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTksXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxQSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxhdHRpY2UgU3VwcG9ydFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxQixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlNtYWxsIExhdHRpY2VcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUMsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIExlZnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUQsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFJpZ2h0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFFLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9yY2ggd2l0aCBEZWJyaXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUYsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJOdWxsXCJcbiAgICB9XG4gIF07XG4gIGZ1bmN0aW9uIEZvcmVUaWxlKGJ5dGUsIHgsIHkpe1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuYnl0ZSA9IGJ5dGU7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIGRhdGEgPSBmb3JldGFibGVUaWxlVHlwZXNbdGhpcy5ieXRlICYgMHgxRl07XG4gICAgaW1wb3J0JCh0aGlzLCBkYXRhKTtcbiAgICB0aGlzLm1vZGlmaWVkID0gKHRoaXMuYnl0ZSAmIDB4MjApID4+IDU7XG4gIH1cbiAgcmV0dXJuIEZvcmVUaWxlO1xufSgpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGRpdiwgUG9wUm9vbSwgUG9wTGV2ZWwsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGRpdiA9IHJlZiQuZGl2O1xuUG9wUm9vbSA9IHJlcXVpcmUoJy4vcm9vbScpLlBvcFJvb207XG5vdXQkLlBvcExldmVsID0gUG9wTGV2ZWwgPSAoZnVuY3Rpb24oKXtcbiAgUG9wTGV2ZWwuZGlzcGxheU5hbWUgPSAnUG9wTGV2ZWwnO1xuICB2YXIgUE9QX1JPT01fU0laRSwgUE9QX0xJTktfU0laRSwgUE9QX1BSRUFNQkxFX09GRlNFVCwgc3BlYywgRkFDSU5HLCBMSU5LSU5HLCBnZXRGYWNpbmcsIHNwZWNTbGljZSwgcHJvdG90eXBlID0gUG9wTGV2ZWwucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBvcExldmVsO1xuICBQT1BfUk9PTV9TSVpFID0gMzA7XG4gIFBPUF9MSU5LX1NJWkUgPSA0O1xuICBQT1BfUFJFQU1CTEVfT0ZGU0VUID0gMTg7XG4gIHNwZWMgPSB7XG4gICAgZm9yZXRhYmxlOiB7XG4gICAgICBvZmZzZXQ6IDAsXG4gICAgICBsZW5ndGg6IDcyMFxuICAgIH0sXG4gICAgYmFja3RhYmxlOiB7XG4gICAgICBvZmZzZXQ6IDcyMCxcbiAgICAgIGxlbmd0aDogNzIwXG4gICAgfSxcbiAgICBsaW5rczoge1xuICAgICAgb2Zmc2V0OiAxOTUyLFxuICAgICAgbGVuZ3RoOiA5NlxuICAgIH0sXG4gICAgZG9vckE6IHtcbiAgICAgIG9mZnNldDogMTQ0MCxcbiAgICAgIGxlbmd0aDogMjU2XG4gICAgfSxcbiAgICBkb29yQjoge1xuICAgICAgb2Zmc2V0OiAxNjk2LFxuICAgICAgbGVuZ3RoOiAyNTZcbiAgICB9LFxuICAgIHN0YXJ0UG9zaXRpb246IHtcbiAgICAgIG9mZnNldDogMjExMixcbiAgICAgIGxlbmd0aDogM1xuICAgIH0sXG4gICAgZ3VhcmRMb2NhdGlvbjoge1xuICAgICAgb2Zmc2V0OiAyMTE5LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgZ3VhcmREaXJlY3Rpb246IHtcbiAgICAgIG9mZnNldDogMjE0MyxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIGd1YXJkU2tpbGw6IHtcbiAgICAgIG9mZnNldDogMjIxNSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIGd1YXJkQ29sb3VyOiB7XG4gICAgICBvZmZzZXQ6IDIyNjMsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duMToge1xuICAgICAgb2Zmc2V0OiAyMDQ4LFxuICAgICAgbGVuZ3RoOiA2NFxuICAgIH0sXG4gICAgdW5rbm93bjI6IHtcbiAgICAgIG9mZnNldDogMjExNSxcbiAgICAgIGxlbmd0aDogM1xuICAgIH0sXG4gICAgdW5rbm93bjM6IHtcbiAgICAgIG9mZnNldDogMjExNixcbiAgICAgIGxlbmd0aDogMVxuICAgIH0sXG4gICAgdW5rbm93bjRhOiB7XG4gICAgICBvZmZzZXQ6IDIxNjcsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duNGI6IHtcbiAgICAgIG9mZnNldDogMjE5MSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIHVua25vd240Yzoge1xuICAgICAgb2Zmc2V0OiAyMjM5LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjRkOiB7XG4gICAgICBvZmZzZXQ6IDIyODcsXG4gICAgICBsZW5ndGg6IDE2XG4gICAgfSxcbiAgICBlbmQ6IHtcbiAgICAgIG9mZnNldDogMjMwMyxcbiAgICAgIGxlbmd0aDogMlxuICAgIH1cbiAgfTtcbiAgRkFDSU5HID0ge1xuICAgIExFRlQ6IFN5bWJvbChcIkZBQ0lOR19MRUZUXCIpLFxuICAgIFJJR0hUOiBTeW1ib2woXCJGQUNJTkdfUklHSFRcIiksXG4gICAgVU5LTk9XTjogU3ltYm9sKFwiRkFDSU5HX1VOS05PV05cIilcbiAgfTtcbiAgTElOS0lORyA9IHtcbiAgICBMRUZUOiAwLFxuICAgIFJJR0hUOiAxLFxuICAgIFVQOiAyLFxuICAgIERPV046IDNcbiAgfTtcbiAgZ2V0RmFjaW5nID0gZnVuY3Rpb24oKXtcbiAgICBzd2l0Y2ggKGZhbHNlKSB7XG4gICAgY2FzZSAhMDpcbiAgICAgIHJldHVybiBGQUNJTkcuTEVGVDtcbiAgICBjYXNlICEyNTU6XG4gICAgICByZXR1cm4gRkFDSU5HLlJJR0hUO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gRkFDSU5HLlVOS05PV047XG4gICAgfVxuICB9O1xuICBzcGVjU2xpY2UgPSBmdW5jdGlvbihidWZmZXIsIGNodW5rKXtcbiAgICByZXR1cm4gYnVmZmVyLnN1YmFycmF5KGNodW5rLm9mZnNldCwgY2h1bmsub2Zmc2V0ICsgY2h1bmsubGVuZ3RoKTtcbiAgfTtcbiAgZnVuY3Rpb24gUG9wTGV2ZWwocmF3KXtcbiAgICBsb2coXCJuZXcgUG9wTGV2ZWxcIik7XG4gICAgdGhpcy5mdWxsID0gbmV3IFVpbnQ4QXJyYXkocmF3KTtcbiAgICB0aGlzLmRhdGEgPSB0aGlzLmZ1bGwuc3ViYXJyYXkoUE9QX1BSRUFNQkxFX09GRlNFVCArIDEsIHRoaXMuZnVsbC5sZW5ndGggLSBQT1BfUFJFQU1CTEVfT0ZGU0VUKTtcbiAgICB0aGlzLnJvb21zID0gdGhpcy5leHRyYWN0Um9vbXModGhpcy5kYXRhKTtcbiAgICB0aGlzLmxpbmtzID0gdGhpcy5leHRyYWN0TGlua3ModGhpcy5kYXRhKTtcbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5leHRyYWN0U3RhcnQodGhpcy5kYXRhKTtcbiAgfVxuICBwcm90b3R5cGUuZXh0cmFjdFJvb21zID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgICB2YXIgcm9vbXMsIHJlcyQsIGkkLCBpLCBzdGFydEluZGV4LCBlbmRJbmRleDtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDI0OyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBzdGFydEluZGV4ID0gc3BlYy5mb3JldGFibGUub2Zmc2V0ICsgaSAqIFBPUF9ST09NX1NJWkU7XG4gICAgICBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBQT1BfUk9PTV9TSVpFO1xuICAgICAgcmVzJC5wdXNoKG5ldyBQb3BSb29tKGkgKyAxLCBidWZmZXIuc3ViYXJyYXkoc3RhcnRJbmRleCwgZW5kSW5kZXgpKSk7XG4gICAgfVxuICAgIHJvb21zID0gcmVzJDtcbiAgICByb29tcy51bnNoaWZ0KFBvcFJvb20uTnVsbFJvb20pO1xuICAgIHJldHVybiByb29tcztcbiAgfTtcbiAgcHJvdG90eXBlLmV4dHJhY3RMaW5rcyA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIGxpbmtzLCByZXMkLCBpJCwgaSwgc3RhcnRJbmRleCwgZW5kSW5kZXgsIGxpbmtEYXRhO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMjQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHN0YXJ0SW5kZXggPSBzcGVjLmxpbmtzLm9mZnNldCArIGkgKiBQT1BfTElOS19TSVpFO1xuICAgICAgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgUE9QX0xJTktfU0laRTtcbiAgICAgIGxpbmtEYXRhID0gYnVmZmVyLnN1YmFycmF5KHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcbiAgICAgIHJlcyQucHVzaCh7XG4gICAgICAgIHVwOiBsaW5rRGF0YVtMSU5LSU5HLlVQXSxcbiAgICAgICAgZG93bjogbGlua0RhdGFbTElOS0lORy5ET1dOXSxcbiAgICAgICAgbGVmdDogbGlua0RhdGFbTElOS0lORy5MRUZUXSxcbiAgICAgICAgcmlnaHQ6IGxpbmtEYXRhW0xJTktJTkcuUklHSFRdXG4gICAgICB9KTtcbiAgICB9XG4gICAgbGlua3MgPSByZXMkO1xuICAgIGxpbmtzLnVuc2hpZnQoe30pO1xuICAgIHJldHVybiBsaW5rcztcbiAgfTtcbiAgcHJvdG90eXBlLmV4dHJhY3RTdGFydCA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIGRhdGE7XG4gICAgZGF0YSA9IHNwZWNTbGljZShidWZmZXIsIHNwZWMuc3RhcnRQb3NpdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb206IGRhdGFbMF0sXG4gICAgICB0aWxlOiBkYXRhWzFdLFxuICAgICAgZmFjaW5nOiBnZXRGYWNpbmcoZGF0YVsyXSlcbiAgICB9O1xuICB9O1xuICByZXR1cm4gUG9wTGV2ZWw7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBkZWxheSwgZGl2LCB0aWxlWCwgdGlsZVksIHRpbGVzUGVyUm9vbSwgdGlsZU92ZXJsYXAsIHJvb21XaWR0aCwgcm9vbUhlaWdodCwgQXNzZXRzLCBCbGl0dGVyLCBGb3JlVGlsZSwgUG9wUm9vbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZGVsYXkgPSByZWYkLmRlbGF5LCBkaXYgPSByZWYkLmRpdjtcbnJlZiQgPSByZXF1aXJlKCcuLi9jb25maWcnKSwgdGlsZVggPSByZWYkLnRpbGVYLCB0aWxlWSA9IHJlZiQudGlsZVksIHRpbGVzUGVyUm9vbSA9IHJlZiQudGlsZXNQZXJSb29tLCB0aWxlT3ZlcmxhcCA9IHJlZiQudGlsZU92ZXJsYXAsIHJvb21XaWR0aCA9IHJlZiQucm9vbVdpZHRoLCByb29tSGVpZ2h0ID0gcmVmJC5yb29tSGVpZ2h0O1xuQXNzZXRzID0gcmVxdWlyZSgnLi4vYXNzZXRzJykuQXNzZXRzO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4uL2JsaXR0ZXInKS5CbGl0dGVyO1xuRm9yZVRpbGUgPSByZXF1aXJlKCcuL2ZvcmV0aWxlJykuRm9yZVRpbGU7XG5vdXQkLlBvcFJvb20gPSBQb3BSb29tID0gKGZ1bmN0aW9uKCl7XG4gIFBvcFJvb20uZGlzcGxheU5hbWUgPSAnUG9wUm9vbSc7XG4gIHZhciBwcm90b3R5cGUgPSBQb3BSb29tLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQb3BSb29tO1xuICBmdW5jdGlvbiBQb3BSb29tKGluZGV4LCBmb3JlYnVmZmVyLCBiYWNrYnVmZmVyKXtcbiAgICB2YXIgaSQsIHRvJCwgaSwgeCwgeSwgdGhpcyQgPSB0aGlzO1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICB0aGlzLmZvcmVidWZmZXIgPSBmb3JlYnVmZmVyO1xuICAgIHRoaXMuYmFja2J1ZmZlciA9IGJhY2tidWZmZXI7XG4gICAgdGhpcy5mb3JldGlsZXMgPSBbW10sIFtdLCBbXV07XG4gICAgdGhpcy5iYWNrdGlsZXMgPSBbW10sIFtdLCBbXV07XG4gICAgdGhpcy5ibGl0dGVyID0gbmV3IEJsaXR0ZXIodGlsZVggKiAocm9vbVdpZHRoICsgMSksIHRpbGVZICogcm9vbUhlaWdodCArIHRpbGVPdmVybGFwKTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGlsZXNQZXJSb29tOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgeCA9IGkgJSByb29tV2lkdGg7XG4gICAgICB5ID0gZGl2KGksIHJvb21XaWR0aCk7XG4gICAgICB0aGlzLmZvcmV0aWxlc1t5XVt4XSA9IG5ldyBGb3JlVGlsZSh0aGlzLmZvcmVidWZmZXJbaV0sIHgsIHkpO1xuICAgIH1cbiAgICBkZWxheSgxMDAsIGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcyQucmVuZGVyKCk7XG4gICAgfSk7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRpbGVzO1xuICAgIHRpbGVzID0gdGhpcy5mb3JldGlsZXM7XG4gICAgcmV0dXJuIHRoaXMuYmxpdHRlci5kcmF3V2l0aChmdW5jdGlvbigpe1xuICAgICAgdmFyIGkkLCByb3dJeCwgbHJlc3VsdCQsIHJvdywgaiQsIGxlbiQsIHRpbGUsIGltYWdlLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IDI7IGkkID49IDA7IC0taSQpIHtcbiAgICAgICAgcm93SXggPSBpJDtcbiAgICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgICAgcm93ID0gdGlsZXNbcm93SXhdO1xuICAgICAgICBmb3IgKGokID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuJDsgKytqJCkge1xuICAgICAgICAgIHRpbGUgPSByb3dbaiRdO1xuICAgICAgICAgIGltYWdlID0gQXNzZXRzLmdldCh0aWxlLm5hbWUpO1xuICAgICAgICAgIGlmIChBc3NldHMuaXNOb25lKGltYWdlKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCh2b2lkIDgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2godGhpcy5kcmF3SW1hZ2UoaW1hZ2UsIHRpbGUueCAqIHRpbGVYLCB0aWxlLnkgKiB0aWxlWSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgICAgICB0aGlzLnN0cm9rZVRleHQodGlsZS5jb2RlLnRvU3RyaW5nKDE2KSwgdGlsZS54ICogdGlsZVggKyB0aWxlWCwgdGlsZS55ICogdGlsZVkgKyB0aWxlWSAqIDAuNyk7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuZmlsbFRleHQodGlsZS5jb2RlLnRvU3RyaW5nKDE2KSwgdGlsZS54ICogdGlsZVggKyB0aWxlWCwgdGlsZS55ICogdGlsZVkgKyB0aWxlWSAqIDAuNykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9KTtcbiAgfTtcbiAgcHJvdG90eXBlLmJsaXRUbyA9IGZ1bmN0aW9uKHRhcmdldCwgeCwgeSl7XG4gICAgcmV0dXJuIHRhcmdldC5jdHguZHJhd0ltYWdlKHRoaXMuYmxpdHRlci5jYW52YXMsIHgsIHkpO1xuICB9O1xuICByZXR1cm4gUG9wUm9vbTtcbn0oKSk7IiwidmFyIGlkLCBsb2csIG1pbiwgbWF4LCBmbG9vciwgcm91bmQsIHNpbiwgY29zLCB0YXUsIGZsaXAsIGRlbGF5LCBldmVyeSwgZGl2LCByYW5kb20sIHJhbmRvbUZyb20sIHJldmVyc2UsIGtleXMsIHZhbHVlcywgZ3JvdXBCeSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLm1pbiA9IG1pbiA9IE1hdGgubWluO1xub3V0JC5tYXggPSBtYXggPSBNYXRoLm1heDtcbm91dCQuZmxvb3IgPSBmbG9vciA9IE1hdGguZmxvb3I7XG5vdXQkLnJvdW5kID0gcm91bmQgPSBNYXRoLnJvdW5kO1xub3V0JC5zaW4gPSBzaW4gPSBNYXRoLnNpbjtcbm91dCQuY29zID0gY29zID0gTWF0aC5jb3M7XG5vdXQkLnRhdSA9IHRhdSA9IE1hdGguUEkgKiAyO1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5ldmVyeSA9IGV2ZXJ5ID0gZmxpcChzZXRJbnRlcnZhbCk7XG5vdXQkLmRpdiA9IGRpdiA9IGN1cnJ5JChmdW5jdGlvbihhLCBiKXtcbiAgcmV0dXJuIGZsb29yKGEgLyBiKTtcbn0pO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpICogaXQ7XG59O1xub3V0JC5yYW5kb21Gcm9tID0gcmFuZG9tRnJvbSA9IGZ1bmN0aW9uKGxpc3Qpe1xuICByZXR1cm4gbGlzdFtmbG9vcihyYW5kb20obGlzdC5sZW5ndGggLSAxKSldO1xufTtcbm91dCQucmV2ZXJzZSA9IHJldmVyc2UgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdC5yZXZlcnNlKCk7XG59O1xub3V0JC5rZXlzID0ga2V5cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGssIHYsIHJlc3VsdHMkID0gW107XG4gIGZvciAoayBpbiBpdCkge1xuICAgIHYgPSBpdFtrXTtcbiAgICByZXN1bHRzJC5wdXNoKGspO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLnZhbHVlcyA9IHZhbHVlcyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGssIHYsIHJlc3VsdHMkID0gW107XG4gIGZvciAoayBpbiBpdCkge1xuICAgIHYgPSBpdFtrXTtcbiAgICByZXN1bHRzJC5wdXNoKHYpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmdyb3VwQnkgPSBncm91cEJ5ID0gZnVuY3Rpb24ozrssIGxpc3Qpe1xuICB2YXIgbywgaSQsIGxlbiQsIHgsIGtleSQ7XG4gIG8gPSB7fTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsaXN0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxpc3RbaSRdO1xuICAgIChvW2tleSQgPSDOuyh4KV0gfHwgKG9ba2V5JF0gPSBbXSkpLnB1c2goeCk7XG4gIH1cbiAgcmV0dXJuIG87XG59O1xuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
