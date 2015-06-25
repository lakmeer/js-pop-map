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
  'null': "",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2Fzc2V0cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2JsaXR0ZXIubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9jb25maWcubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9sZXZlbC9mb3JldGlsZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2xldmVsL2luZGV4LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbGV2ZWwvcm9vbS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL3N0ZC9pbmRleC5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBpZCwgbG9nLCBrZXlzLCByYW5kb21Gcm9tLCBkZWxheSwgZXZlcnksIGdyb3VwQnksIHZhbHVlcywgcmV2ZXJzZSwgQXNzZXRzLCBCbGl0dGVyLCBQb3BMZXZlbCwgdGlsZVgsIHRpbGVZLCB0aWxlc1BlclJvb20sIHJvb21XaWR0aCwgcm9vbUhlaWdodCwgbGV2ZWxEYXRhLCB4aHI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGtleXMgPSByZWYkLmtleXMsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb20sIGRlbGF5ID0gcmVmJC5kZWxheSwgZXZlcnkgPSByZWYkLmV2ZXJ5LCBncm91cEJ5ID0gcmVmJC5ncm91cEJ5LCB2YWx1ZXMgPSByZWYkLnZhbHVlcywgcmV2ZXJzZSA9IHJlZiQucmV2ZXJzZTtcbkFzc2V0cyA9IHJlcXVpcmUoJy4vYXNzZXRzJykuQXNzZXRzO1xuQmxpdHRlciA9IHJlcXVpcmUoJy4vYmxpdHRlcicpLkJsaXR0ZXI7XG5Qb3BMZXZlbCA9IHJlcXVpcmUoJy4vbGV2ZWwnKS5Qb3BMZXZlbDtcbnJlZiQgPSByZXF1aXJlKCcuL2NvbmZpZycpLCB0aWxlWCA9IHJlZiQudGlsZVgsIHRpbGVZID0gcmVmJC50aWxlWSwgdGlsZXNQZXJSb29tID0gcmVmJC50aWxlc1BlclJvb20sIHJvb21XaWR0aCA9IHJlZiQucm9vbVdpZHRoLCByb29tSGVpZ2h0ID0gcmVmJC5yb29tSGVpZ2h0O1xubGV2ZWxEYXRhID0ge307XG54aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG54aHIub3BlbignR0VUJywgXCJsZXZlbHMvMDIucGx2XCIsIHRydWUpO1xueGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG54aHIuc2VuZCgpO1xueGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBtYWluQmxpdHRlciwgZ2V0Um9vbU9mZnNldHMsIGdldFJvb21Db29yZHMsIGRpc2NvdmVyUm9vbVBvc2l0aW9ucywgc29ydEJ5RHJhd2luZ09yZGVyLCBkcmF3Um9vbVdpdGhOZWlnaGJvdXJzLCBkcmF3TmVpZ2hib3VyLCBkcmF3QWxsUm9vbXMsIHBhbiwgbGFzdE1vdXNlLCBkcmFnZ2luZywgcm9vbUNvb3JkcztcbiAgbGV2ZWxEYXRhID0gbmV3IFBvcExldmVsKHRoaXMucmVzcG9uc2UpO1xuICBtYWluQmxpdHRlciA9IG5ldyBCbGl0dGVyKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICBnZXRSb29tT2Zmc2V0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgICBzd2l0Y2ggKGl0KSB7XG4gICAgY2FzZSAndXAnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogdGlsZVkgKiAtcm9vbUhlaWdodFxuICAgICAgfTtcbiAgICBjYXNlICdkb3duJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IHRpbGVZICogcm9vbUhlaWdodFxuICAgICAgfTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHRpbGVYICogLXJvb21XaWR0aCxcbiAgICAgICAgeTogMFxuICAgICAgfTtcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB0aWxlWCAqIHJvb21XaWR0aCxcbiAgICAgICAgeTogMFxuICAgICAgfTtcbiAgICB9XG4gIH07XG4gIGdldFJvb21Db29yZHMgPSBmdW5jdGlvbihkaXIsIGFyZyQpe1xuICAgIHZhciB4LCB5O1xuICAgIHggPSBhcmckLngsIHkgPSBhcmckLnk7XG4gICAgc3dpdGNoIChkaXIpIHtcbiAgICBjYXNlICd1cCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5IC0gMVxuICAgICAgfTtcbiAgICBjYXNlICdkb3duJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHkgKyAxXG4gICAgICB9O1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCAtIDEsXG4gICAgICAgIHk6IHlcbiAgICAgIH07XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCArIDEsXG4gICAgICAgIHk6IHlcbiAgICAgIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKCdXaGF0PycpO1xuICAgIH1cbiAgfTtcbiAgZGlzY292ZXJSb29tUG9zaXRpb25zID0gZnVuY3Rpb24ocm9vbSl7XG4gICAgdmFyIGNvb3JkcywgZmV0Y2hVbnJlc29sdmVkO1xuICAgIGNvb3JkcyA9IFtdO1xuICAgIGNvb3Jkc1tyb29tXSA9IHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcbiAgICBmZXRjaFVucmVzb2x2ZWQgPSBmdW5jdGlvbihyb29tKXtcbiAgICAgIHZhciBsaW5rcywgZGlyLCBpbmRleCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGxpbmtzID0gbGV2ZWxEYXRhLmxpbmtzW3Jvb21dO1xuICAgICAgZm9yIChkaXIgaW4gbGlua3MpIHtcbiAgICAgICAgaW5kZXggPSBsaW5rc1tkaXJdO1xuICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgaWYgKCFjb29yZHNbaW5kZXhdKSB7XG4gICAgICAgICAgICBjb29yZHNbaW5kZXhdID0gZ2V0Um9vbUNvb3JkcyhkaXIsIGNvb3Jkc1tyb29tXSk7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKGZldGNoVW5yZXNvbHZlZChpbmRleCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH07XG4gICAgZmV0Y2hVbnJlc29sdmVkKHJvb20pO1xuICAgIHJldHVybiBzb3J0QnlEcmF3aW5nT3JkZXIoY29vcmRzKTtcbiAgfTtcbiAgc29ydEJ5RHJhd2luZ09yZGVyID0gZnVuY3Rpb24ocmF3Q29vcmRzKXtcbiAgICB2YXIgbmVhdENvb3JkcywgcmVzJCwgaW5kZXgsIHJlZiQsIHgsIHksIHJvd3M7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaW5kZXggaW4gcmF3Q29vcmRzKSB7XG4gICAgICByZWYkID0gcmF3Q29vcmRzW2luZGV4XSwgeCA9IHJlZiQueCwgeSA9IHJlZiQueTtcbiAgICAgIHJlcyQucHVzaCh7XG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeVxuICAgICAgfSk7XG4gICAgfVxuICAgIG5lYXRDb29yZHMgPSByZXMkO1xuICAgIHJvd3MgPSB2YWx1ZXMoZ3JvdXBCeShmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQueTtcbiAgICB9LCBuZWF0Q29vcmRzKSk7XG4gICAgcm93cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGFbMF0ueSA8IGJbMF0ueTtcbiAgICB9KTtcbiAgICByb3dzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgcmV0dXJuIGEueCA+IGIueDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByb3dzO1xuICB9O1xuICBkcmF3Um9vbVdpdGhOZWlnaGJvdXJzID0gZnVuY3Rpb24ocm9vbSwgb3gsIG95KXtcbiAgICB2YXIgbGlua3M7XG4gICAgbGlua3MgPSBsZXZlbERhdGEubGlua3Nbcm9vbV07XG4gICAgZHJhd05laWdoYm91cihsaW5rcywgJ2Rvd24nLCBveCwgb3kpO1xuICAgIGRyYXdOZWlnaGJvdXIobGlua3MsICdsZWZ0Jywgb3gsIG95KTtcbiAgICBsZXZlbERhdGEucm9vbXNbcm9vbV0uYmxpdFRvKG1haW5CbGl0dGVyLCBveCwgb3kpO1xuICAgIGRyYXdOZWlnaGJvdXIobGlua3MsICdyaWdodCcsIG94LCBveSk7XG4gICAgcmV0dXJuIGRyYXdOZWlnaGJvdXIobGlua3MsICd1cCcsIG94LCBveSk7XG4gIH07XG4gIGRyYXdOZWlnaGJvdXIgPSBmdW5jdGlvbihsaW5rcywgZGlyLCBveCwgb3kpe1xuICAgIHZhciB0aGF0LCByZWYkLCB4LCB5O1xuICAgIGlmICh0aGF0ID0gbGlua3NbZGlyXSkge1xuICAgICAgcmVmJCA9IGdldFJvb21PZmZzZXRzKGRpciksIHggPSByZWYkLngsIHkgPSByZWYkLnk7XG4gICAgICByZXR1cm4gbGV2ZWxEYXRhLnJvb21zW3RoYXRdLmJsaXRUbyhtYWluQmxpdHRlciwgb3ggKyB4LCBveSArIHkpO1xuICAgIH1cbiAgfTtcbiAgZHJhd0FsbFJvb21zID0gZnVuY3Rpb24oY29vcmRSb3dzLCBweCwgcHkpe1xuICAgIHZhciBpJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCByZWYkLCBpbmRleCwgeCwgeSwgcngsIHJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY29vcmRSb3dzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICByb3cgPSBjb29yZFJvd3NbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgcmVmJCA9IHJvd1tqJF0sIGluZGV4ID0gcmVmJC5pbmRleCwgeCA9IHJlZiQueCwgeSA9IHJlZiQueTtcbiAgICAgICAgcnggPSB0aWxlWCAqIHJvb21XaWR0aCAqIHg7XG4gICAgICAgIHJ5ID0gdGlsZVkgKiByb29tSGVpZ2h0ICogeTtcbiAgICAgICAgbHJlc3VsdCQucHVzaChsZXZlbERhdGEucm9vbXNbaW5kZXhdLmJsaXRUbyhtYWluQmxpdHRlciwgcnggKyBweCwgcnkgKyBweSkpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcGFuID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuICBsYXN0TW91c2UgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH07XG4gIGRyYWdnaW5nID0gZmFsc2U7XG4gIHJvb21Db29yZHMgPSBkaXNjb3ZlclJvb21Qb3NpdGlvbnMobGV2ZWxEYXRhLnN0YXJ0LnJvb20pO1xuICBtYWluQmxpdHRlci5vbignbW91c2Vkb3duJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZHJhZ2dpbmcgPSB0cnVlO1xuICB9KTtcbiAgbWFpbkJsaXR0ZXIub24oJ21vdXNldXAnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgbWFpbkJsaXR0ZXIub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICB2YXIgzpR4LCDOlHk7XG4gICAgzpR4ID0gbGFzdE1vdXNlLnggLSBldmVudC5vZmZzZXRYO1xuICAgIM6UeSA9IGxhc3RNb3VzZS55IC0gZXZlbnQub2Zmc2V0WTtcbiAgICBsYXN0TW91c2UueCA9IGV2ZW50Lm9mZnNldFg7XG4gICAgbGFzdE1vdXNlLnkgPSBldmVudC5vZmZzZXRZO1xuICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgcGFuLnggLT0gzpR4O1xuICAgICAgcGFuLnkgLT0gzpR5O1xuICAgICAgbWFpbkJsaXR0ZXIuY2xlYXIoKTtcbiAgICAgIHJldHVybiBkcmF3QWxsUm9vbXMocm9vbUNvb3JkcywgcGFuLngsIHBhbi55KTtcbiAgICB9XG4gIH0pO1xuICBtYWluQmxpdHRlci5pbnN0YWxsKGRvY3VtZW50LmJvZHkpO1xuICByZXR1cm4gZGVsYXkoMTAwLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmF3QWxsUm9vbXMocm9vbUNvb3JkcywgMCwgMCk7XG4gIH0pO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgbG9hZEltZywgc3ByaXRlcywgQXNzZXRzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xubG9hZEltZyA9IGZ1bmN0aW9uKHNyYyl7XG4gIHZhciBpO1xuICBpID0gbmV3IEltYWdlO1xuICBpLnNyYyA9ICcvdGlsZXMvJyArIHNyYyArICcucG5nJztcbiAgcmV0dXJuIGk7XG59O1xuc3ByaXRlcyA9IHtcbiAgJ251bGwnOiBcIlwiLFxuICBibGFuazogbmV3IEltYWdlLFxuICB3YWxsOiBsb2FkSW1nKCd3YWxsJyksXG4gIHRvcmNoOiBsb2FkSW1nKCd0b3JjaCcpLFxuICBmbG9vcjogbG9hZEltZygnZmxvb3InKSxcbiAgcGlsbGFyOiBsb2FkSW1nKCdwaWxsYXJzJyksXG4gIGRlYnJpczogbG9hZEltZygnZGVicmlzJyksXG4gIHVuc3RhYmxlOiBsb2FkSW1nKCd1bnN0YWJsZScpLFxuICBnYXRlOiBsb2FkSW1nKCdnYXRlJyksXG4gIHBsYXRlOiBsb2FkSW1nKCdwbGF0ZScpLFxuICByZWQ6IGxvYWRJbWcoJ3BvdGlvbi1yZWQnKSxcbiAgc2xhbTogbG9hZEltZygnc2xhbScpLFxuICBzcGlrZXM6IGxvYWRJbWcoJ3NwaWtlcycpLFxuICBleGl0TGVmdDogbG9hZEltZygnZXhpdC1sZWZ0JyksXG4gIGV4aXRSaWdodDogbG9hZEltZygnZXhpdC1yaWdodCcpLFxuICBza2VsZXRvbjogbG9hZEltZygnc2tlbGV0b24nKSxcbiAgc3dvcmQ6IGxvYWRJbWcoJ3N3b3JkJylcbn07XG5vdXQkLkFzc2V0cyA9IEFzc2V0cyA9IHtcbiAgZ2V0OiBmdW5jdGlvbihpdCl7XG4gICAgc3dpdGNoIChpdCkge1xuICAgIGNhc2UgXCJFbXB0eVwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuYmxhbms7XG4gICAgY2FzZSBcIlRvcmNoXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy50b3JjaDtcbiAgICBjYXNlIFwiU3Bpa2VzXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5zcGlrZXM7XG4gICAgY2FzZSBcIldhbGxcIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLndhbGw7XG4gICAgY2FzZSBcIkZsb29yXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5mbG9vcjtcbiAgICBjYXNlIFwiUGlsbGFyXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5waWxsYXI7XG4gICAgY2FzZSBcIkRlYnJpc1wiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuZGVicmlzO1xuICAgIGNhc2UgXCJMb29zZSBCb2FyZFwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMudW5zdGFibGU7XG4gICAgY2FzZSBcIkdhdGVcIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLmdhdGU7XG4gICAgY2FzZSBcIlBvdGlvblwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMucmVkO1xuICAgIGNhc2UgXCJSYWlzZSBCdXR0b25cIjpcbiAgICAgIHJldHVybiBzcHJpdGVzLnBsYXRlO1xuICAgIGNhc2UgXCJEcm9wIEJ1dHRvblwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuc2xhbTtcbiAgICBjYXNlIFwiRXhpdCBMZWZ0XCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5leGl0TGVmdDtcbiAgICBjYXNlIFwiRXhpdCBSaWdodFwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuZXhpdFJpZ2h0O1xuICAgIGNhc2UgXCJTa2VsZXRvblwiOlxuICAgICAgcmV0dXJuIHNwcml0ZXMuc2tlbGV0b247XG4gICAgY2FzZSBcIlN3b3JkXCI6XG4gICAgICByZXR1cm4gc3ByaXRlcy5zd29yZDtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHNwcml0ZXNbJ251bGwnXTtcbiAgICB9XG4gIH0sXG4gIGlzTm9uZTogZnVuY3Rpb24oYXNzZXQpe1xuICAgIHJldHVybiBhc3NldCA9PT0gc3ByaXRlc1snbnVsbCddO1xuICB9XG59OyIsInZhciBCbGl0dGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5CbGl0dGVyID0gQmxpdHRlciA9IChmdW5jdGlvbigpe1xuICBCbGl0dGVyLmRpc3BsYXlOYW1lID0gJ0JsaXR0ZXInO1xuICB2YXIgcHJvdG90eXBlID0gQmxpdHRlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQmxpdHRlcjtcbiAgZnVuY3Rpb24gQmxpdHRlcih3LCBoKXtcbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHc7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gaDtcbiAgICB0aGlzLnNldERlYnVnRm9udCgpO1xuICB9XG4gIHByb3RvdHlwZS5kcmF3V2l0aCA9IGZ1bmN0aW9uKM67KXtcbiAgICByZXR1cm4gzrsuY2FsbCh0aGlzLmN0eCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCDOuyl7XG4gICAgcmV0dXJuIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIM67KTtcbiAgfTtcbiAgcHJvdG90eXBlLmJsaXRUbyA9IGZ1bmN0aW9uKHRhcmdldCwgeCwgeSl7XG4gICAgcmV0dXJuIHRhcmdldC5jdHguZHJhd0ltYWdlKHRoaXMuY2FudmFzLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUuaW5zdGFsbCA9IGZ1bmN0aW9uKGhvc3Qpe1xuICAgIHJldHVybiBob3N0LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNldERlYnVnRm9udCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgdGhpcy5jdHgudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgcmV0dXJuIHRoaXMuY3R4LmZvbnQgPSBcIjE2cHggbW9ub3NwYWNlXCI7XG4gIH07XG4gIHJldHVybiBCbGl0dGVyO1xufSgpKTsiLCJ2YXIgdGlsZVgsIHRpbGVZLCB6eiwgdGlsZU92ZXJsYXAsIHJvb21XaWR0aCwgcm9vbUhlaWdodCwgdGlsZXNQZXJSb29tLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC50aWxlWCA9IHRpbGVYID0gMzI7XG5vdXQkLnRpbGVZID0gdGlsZVkgPSA2Mztcbm91dCQuenogPSB6eiA9IDEwO1xub3V0JC50aWxlT3ZlcmxhcCA9IHRpbGVPdmVybGFwID0gMTU7XG5vdXQkLnJvb21XaWR0aCA9IHJvb21XaWR0aCA9IDEwO1xub3V0JC5yb29tSGVpZ2h0ID0gcm9vbUhlaWdodCA9IDM7XG5vdXQkLnRpbGVzUGVyUm9vbSA9IHRpbGVzUGVyUm9vbSA9IHJvb21XaWR0aCAqIHJvb21IZWlnaHQ7IiwidmFyIEZvcmVUaWxlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5Gb3JlVGlsZSA9IEZvcmVUaWxlID0gKGZ1bmN0aW9uKCl7XG4gIEZvcmVUaWxlLmRpc3BsYXlOYW1lID0gJ0ZvcmVUaWxlJztcbiAgdmFyIGZvcmV0YWJsZVRpbGVUeXBlcywgcHJvdG90eXBlID0gRm9yZVRpbGUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZvcmVUaWxlO1xuICBmb3JldGFibGVUaWxlVHlwZXMgPSBbXG4gICAge1xuICAgICAgY29kZTogMHgwMCxcbiAgICAgIGdyb3VwOiAnZnJlZScsXG4gICAgICBuYW1lOiBcIkVtcHR5XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDAxLFxuICAgICAgZ3JvdXA6ICdmcmVlJyxcbiAgICAgIG5hbWU6IFwiRmxvb3JcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDIsXG4gICAgICBncm91cDogJ3NwaWtlJyxcbiAgICAgIG5hbWU6IFwiU3Bpa2VzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDAzLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiUGlsbGFyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA0LFxuICAgICAgZ3JvdXA6ICdnYXRlJyxcbiAgICAgIG5hbWU6IFwiR2F0ZVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwNSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlN0dWNrIEJ1dHRvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwNixcbiAgICAgIGdyb3VwOiAnZXZlbnQnLFxuICAgICAgbmFtZTogXCJEcm9wIEJ1dHRvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwNyxcbiAgICAgIGdyb3VwOiAndGFwZXN0JyxcbiAgICAgIG5hbWU6IFwiVGFwZXN0cnlcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDgsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCb3R0b20gQmlnLXBpbGxhclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwOSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcCBCaWctcGlsbGFyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBBLFxuICAgICAgZ3JvdXA6ICdwb3Rpb24nLFxuICAgICAgbmFtZTogXCJQb3Rpb25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEIsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMb29zZSBCb2FyZFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwQyxcbiAgICAgIGdyb3VwOiAndHRvcCcsXG4gICAgICBuYW1lOiBcIlRhcGVzdHJ5IFRvcFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwRCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIk1pcnJvclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwRSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkRlYnJpc1wiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwRixcbiAgICAgIGdyb3VwOiAnZXZlbnQnLFxuICAgICAgbmFtZTogXCJSYWlzZSBCdXR0b25cIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTAsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJFeGl0IExlZnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTEsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJFeGl0IFJpZ2h0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDEyLFxuICAgICAgZ3JvdXA6ICdjaG9tcCcsXG4gICAgICBuYW1lOiBcIkNob3BwZXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTMsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJUb3JjaFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNCxcbiAgICAgIGdyb3VwOiAnd2FsbCcsXG4gICAgICBuYW1lOiBcIldhbGxcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTUsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTa2VsZXRvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlN3b3JkXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE3LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiQmFsY29ueSBMZWZ0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE4LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiQmFsY29ueSBSaWdodFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxOSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxhdHRpY2UgUGlsbGFyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFBLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBTdXBwb3J0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFCLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU21hbGwgTGF0dGljZVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxQyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxhdHRpY2UgTGVmdFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxRCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxhdHRpY2UgUmlnaHRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUUsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJUb3JjaCB3aXRoIERlYnJpc1wiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxRixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIk51bGxcIlxuICAgIH1cbiAgXTtcbiAgZnVuY3Rpb24gRm9yZVRpbGUoYnl0ZSwgeCwgeSl7XG4gICAgdmFyIGRhdGE7XG4gICAgdGhpcy5ieXRlID0gYnl0ZTtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgZGF0YSA9IGZvcmV0YWJsZVRpbGVUeXBlc1t0aGlzLmJ5dGUgJiAweDFGXTtcbiAgICBpbXBvcnQkKHRoaXMsIGRhdGEpO1xuICAgIHRoaXMubW9kaWZpZWQgPSAodGhpcy5ieXRlICYgMHgyMCkgPj4gNTtcbiAgfVxuICByZXR1cm4gRm9yZVRpbGU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZGl2LCBQb3BSb29tLCBQb3BMZXZlbCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZGl2ID0gcmVmJC5kaXY7XG5Qb3BSb29tID0gcmVxdWlyZSgnLi9yb29tJykuUG9wUm9vbTtcbm91dCQuUG9wTGV2ZWwgPSBQb3BMZXZlbCA9IChmdW5jdGlvbigpe1xuICBQb3BMZXZlbC5kaXNwbGF5TmFtZSA9ICdQb3BMZXZlbCc7XG4gIHZhciBQT1BfUk9PTV9TSVpFLCBQT1BfTElOS19TSVpFLCBQT1BfUFJFQU1CTEVfT0ZGU0VULCBzcGVjLCBGQUNJTkcsIExJTktJTkcsIGdldEZhY2luZywgc3BlY1NsaWNlLCBwcm90b3R5cGUgPSBQb3BMZXZlbC5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUG9wTGV2ZWw7XG4gIFBPUF9ST09NX1NJWkUgPSAzMDtcbiAgUE9QX0xJTktfU0laRSA9IDQ7XG4gIFBPUF9QUkVBTUJMRV9PRkZTRVQgPSAxODtcbiAgc3BlYyA9IHtcbiAgICBmb3JldGFibGU6IHtcbiAgICAgIG9mZnNldDogMCxcbiAgICAgIGxlbmd0aDogNzIwXG4gICAgfSxcbiAgICBiYWNrdGFibGU6IHtcbiAgICAgIG9mZnNldDogNzIwLFxuICAgICAgbGVuZ3RoOiA3MjBcbiAgICB9LFxuICAgIGxpbmtzOiB7XG4gICAgICBvZmZzZXQ6IDE5NTIsXG4gICAgICBsZW5ndGg6IDk2XG4gICAgfSxcbiAgICBkb29yQToge1xuICAgICAgb2Zmc2V0OiAxNDQwLFxuICAgICAgbGVuZ3RoOiAyNTZcbiAgICB9LFxuICAgIGRvb3JCOiB7XG4gICAgICBvZmZzZXQ6IDE2OTYsXG4gICAgICBsZW5ndGg6IDI1NlxuICAgIH0sXG4gICAgc3RhcnRQb3NpdGlvbjoge1xuICAgICAgb2Zmc2V0OiAyMTEyLFxuICAgICAgbGVuZ3RoOiAzXG4gICAgfSxcbiAgICBndWFyZExvY2F0aW9uOiB7XG4gICAgICBvZmZzZXQ6IDIxMTksXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICBndWFyZERpcmVjdGlvbjoge1xuICAgICAgb2Zmc2V0OiAyMTQzLFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgZ3VhcmRTa2lsbDoge1xuICAgICAgb2Zmc2V0OiAyMjE1LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgZ3VhcmRDb2xvdXI6IHtcbiAgICAgIG9mZnNldDogMjI2MyxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIHVua25vd24xOiB7XG4gICAgICBvZmZzZXQ6IDIwNDgsXG4gICAgICBsZW5ndGg6IDY0XG4gICAgfSxcbiAgICB1bmtub3duMjoge1xuICAgICAgb2Zmc2V0OiAyMTE1LFxuICAgICAgbGVuZ3RoOiAzXG4gICAgfSxcbiAgICB1bmtub3duMzoge1xuICAgICAgb2Zmc2V0OiAyMTE2LFxuICAgICAgbGVuZ3RoOiAxXG4gICAgfSxcbiAgICB1bmtub3duNGE6IHtcbiAgICAgIG9mZnNldDogMjE2NyxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIHVua25vd240Yjoge1xuICAgICAgb2Zmc2V0OiAyMTkxLFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjRjOiB7XG4gICAgICBvZmZzZXQ6IDIyMzksXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duNGQ6IHtcbiAgICAgIG9mZnNldDogMjI4NyxcbiAgICAgIGxlbmd0aDogMTZcbiAgICB9LFxuICAgIGVuZDoge1xuICAgICAgb2Zmc2V0OiAyMzAzLFxuICAgICAgbGVuZ3RoOiAyXG4gICAgfVxuICB9O1xuICBGQUNJTkcgPSB7XG4gICAgTEVGVDogU3ltYm9sKFwiRkFDSU5HX0xFRlRcIiksXG4gICAgUklHSFQ6IFN5bWJvbChcIkZBQ0lOR19SSUdIVFwiKSxcbiAgICBVTktOT1dOOiBTeW1ib2woXCJGQUNJTkdfVU5LTk9XTlwiKVxuICB9O1xuICBMSU5LSU5HID0ge1xuICAgIExFRlQ6IDAsXG4gICAgUklHSFQ6IDEsXG4gICAgVVA6IDIsXG4gICAgRE9XTjogM1xuICB9O1xuICBnZXRGYWNpbmcgPSBmdW5jdGlvbigpe1xuICAgIHN3aXRjaCAoZmFsc2UpIHtcbiAgICBjYXNlICEwOlxuICAgICAgcmV0dXJuIEZBQ0lORy5MRUZUO1xuICAgIGNhc2UgITI1NTpcbiAgICAgIHJldHVybiBGQUNJTkcuUklHSFQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBGQUNJTkcuVU5LTk9XTjtcbiAgICB9XG4gIH07XG4gIHNwZWNTbGljZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgY2h1bmspe1xuICAgIHJldHVybiBidWZmZXIuc3ViYXJyYXkoY2h1bmsub2Zmc2V0LCBjaHVuay5vZmZzZXQgKyBjaHVuay5sZW5ndGgpO1xuICB9O1xuICBmdW5jdGlvbiBQb3BMZXZlbChyYXcpe1xuICAgIGxvZyhcIm5ldyBQb3BMZXZlbFwiKTtcbiAgICB0aGlzLmZ1bGwgPSBuZXcgVWludDhBcnJheShyYXcpO1xuICAgIHRoaXMuZGF0YSA9IHRoaXMuZnVsbC5zdWJhcnJheShQT1BfUFJFQU1CTEVfT0ZGU0VUICsgMSwgdGhpcy5mdWxsLmxlbmd0aCAtIFBPUF9QUkVBTUJMRV9PRkZTRVQpO1xuICAgIHRoaXMucm9vbXMgPSB0aGlzLmV4dHJhY3RSb29tcyh0aGlzLmRhdGEpO1xuICAgIHRoaXMubGlua3MgPSB0aGlzLmV4dHJhY3RMaW5rcyh0aGlzLmRhdGEpO1xuICAgIHRoaXMuc3RhcnQgPSB0aGlzLmV4dHJhY3RTdGFydCh0aGlzLmRhdGEpO1xuICB9XG4gIHByb3RvdHlwZS5leHRyYWN0Um9vbXMgPSBmdW5jdGlvbihidWZmZXIpe1xuICAgIHZhciByb29tcywgcmVzJCwgaSQsIGksIHN0YXJ0SW5kZXgsIGVuZEluZGV4O1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMjQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHN0YXJ0SW5kZXggPSBzcGVjLmZvcmV0YWJsZS5vZmZzZXQgKyBpICogUE9QX1JPT01fU0laRTtcbiAgICAgIGVuZEluZGV4ID0gc3RhcnRJbmRleCArIFBPUF9ST09NX1NJWkU7XG4gICAgICByZXMkLnB1c2gobmV3IFBvcFJvb20oaSArIDEsIGJ1ZmZlci5zdWJhcnJheShzdGFydEluZGV4LCBlbmRJbmRleCkpKTtcbiAgICB9XG4gICAgcm9vbXMgPSByZXMkO1xuICAgIHJvb21zLnVuc2hpZnQoUG9wUm9vbS5OdWxsUm9vbSk7XG4gICAgcmV0dXJuIHJvb21zO1xuICB9O1xuICBwcm90b3R5cGUuZXh0cmFjdExpbmtzID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgICB2YXIgbGlua3MsIHJlcyQsIGkkLCBpLCBzdGFydEluZGV4LCBlbmRJbmRleCwgbGlua0RhdGE7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSAyNDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgc3RhcnRJbmRleCA9IHNwZWMubGlua3Mub2Zmc2V0ICsgaSAqIFBPUF9MSU5LX1NJWkU7XG4gICAgICBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBQT1BfTElOS19TSVpFO1xuICAgICAgbGlua0RhdGEgPSBidWZmZXIuc3ViYXJyYXkoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuICAgICAgcmVzJC5wdXNoKHtcbiAgICAgICAgdXA6IGxpbmtEYXRhW0xJTktJTkcuVVBdLFxuICAgICAgICBkb3duOiBsaW5rRGF0YVtMSU5LSU5HLkRPV05dLFxuICAgICAgICBsZWZ0OiBsaW5rRGF0YVtMSU5LSU5HLkxFRlRdLFxuICAgICAgICByaWdodDogbGlua0RhdGFbTElOS0lORy5SSUdIVF1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBsaW5rcyA9IHJlcyQ7XG4gICAgbGlua3MudW5zaGlmdCh7fSk7XG4gICAgcmV0dXJuIGxpbmtzO1xuICB9O1xuICBwcm90b3R5cGUuZXh0cmFjdFN0YXJ0ID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgICB2YXIgZGF0YTtcbiAgICBkYXRhID0gc3BlY1NsaWNlKGJ1ZmZlciwgc3BlYy5zdGFydFBvc2l0aW9uKTtcbiAgICByZXR1cm4ge1xuICAgICAgcm9vbTogZGF0YVswXSxcbiAgICAgIHRpbGU6IGRhdGFbMV0sXG4gICAgICBmYWNpbmc6IGdldEZhY2luZyhkYXRhWzJdKVxuICAgIH07XG4gIH07XG4gIHJldHVybiBQb3BMZXZlbDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIGRlbGF5LCBkaXYsIHRpbGVYLCB0aWxlWSwgdGlsZXNQZXJSb29tLCB0aWxlT3ZlcmxhcCwgcm9vbVdpZHRoLCByb29tSGVpZ2h0LCBBc3NldHMsIEJsaXR0ZXIsIEZvcmVUaWxlLCBQb3BSb29tLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXksIGRpdiA9IHJlZiQuZGl2O1xucmVmJCA9IHJlcXVpcmUoJy4uL2NvbmZpZycpLCB0aWxlWCA9IHJlZiQudGlsZVgsIHRpbGVZID0gcmVmJC50aWxlWSwgdGlsZXNQZXJSb29tID0gcmVmJC50aWxlc1BlclJvb20sIHRpbGVPdmVybGFwID0gcmVmJC50aWxlT3ZlcmxhcCwgcm9vbVdpZHRoID0gcmVmJC5yb29tV2lkdGgsIHJvb21IZWlnaHQgPSByZWYkLnJvb21IZWlnaHQ7XG5Bc3NldHMgPSByZXF1aXJlKCcuLi9hc3NldHMnKS5Bc3NldHM7XG5CbGl0dGVyID0gcmVxdWlyZSgnLi4vYmxpdHRlcicpLkJsaXR0ZXI7XG5Gb3JlVGlsZSA9IHJlcXVpcmUoJy4vZm9yZXRpbGUnKS5Gb3JlVGlsZTtcbm91dCQuUG9wUm9vbSA9IFBvcFJvb20gPSAoZnVuY3Rpb24oKXtcbiAgUG9wUm9vbS5kaXNwbGF5TmFtZSA9ICdQb3BSb29tJztcbiAgdmFyIHByb3RvdHlwZSA9IFBvcFJvb20ucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBvcFJvb207XG4gIGZ1bmN0aW9uIFBvcFJvb20oaW5kZXgsIGZvcmVidWZmZXIsIGJhY2tidWZmZXIpe1xuICAgIHZhciBpJCwgdG8kLCBpLCB4LCB5LCB0aGlzJCA9IHRoaXM7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuZm9yZWJ1ZmZlciA9IGZvcmVidWZmZXI7XG4gICAgdGhpcy5iYWNrYnVmZmVyID0gYmFja2J1ZmZlcjtcbiAgICB0aGlzLmZvcmV0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICB0aGlzLmJhY2t0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICB0aGlzLmJsaXR0ZXIgPSBuZXcgQmxpdHRlcih0aWxlWCAqIChyb29tV2lkdGggKyAxKSwgdGlsZVkgKiByb29tSGVpZ2h0ICsgdGlsZU92ZXJsYXApO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aWxlc1BlclJvb207IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB4ID0gaSAlIHJvb21XaWR0aDtcbiAgICAgIHkgPSBkaXYoaSwgcm9vbVdpZHRoKTtcbiAgICAgIHRoaXMuZm9yZXRpbGVzW3ldW3hdID0gbmV3IEZvcmVUaWxlKHRoaXMuZm9yZWJ1ZmZlcltpXSwgeCwgeSk7XG4gICAgfVxuICAgIGRlbGF5KDEwMCwgZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzJC5yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdGlsZXM7XG4gICAgdGlsZXMgPSB0aGlzLmZvcmV0aWxlcztcbiAgICByZXR1cm4gdGhpcy5ibGl0dGVyLmRyYXdXaXRoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaSQsIHJvd0l4LCBscmVzdWx0JCwgcm93LCBqJCwgbGVuJCwgdGlsZSwgaW1hZ2UsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMjsgaSQgPj0gMDsgLS1pJCkge1xuICAgICAgICByb3dJeCA9IGkkO1xuICAgICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgICByb3cgPSB0aWxlc1tyb3dJeF07XG4gICAgICAgIGZvciAoaiQgPSAwLCBsZW4kID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4kOyArK2okKSB7XG4gICAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgICAgaW1hZ2UgPSBBc3NldHMuZ2V0KHRpbGUubmFtZSk7XG4gICAgICAgICAgaWYgKEFzc2V0cy5pc05vbmUoaW1hZ2UpKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICAgICAgICB0aGlzLnN0cm9rZVRleHQodGlsZS5jb2RlLnRvU3RyaW5nKDE2KSwgdGlsZS54ICogdGlsZVggKyB0aWxlWCwgdGlsZS55ICogdGlsZVkgKyB0aWxlWSAqIDAuNyk7XG4gICAgICAgICAgICB0aGlzLmZpbGxUZXh0KHRpbGUuY29kZS50b1N0cmluZygxNiksIHRpbGUueCAqIHRpbGVYICsgdGlsZVgsIHRpbGUueSAqIHRpbGVZICsgdGlsZVkgKiAwLjcpO1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCh2b2lkIDgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuZHJhd0ltYWdlKGltYWdlLCB0aWxlLnggKiB0aWxlWCwgdGlsZS55ICogdGlsZVkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfSk7XG4gIH07XG4gIHByb3RvdHlwZS5ibGl0VG8gPSBmdW5jdGlvbih0YXJnZXQsIHgsIHkpe1xuICAgIHJldHVybiB0YXJnZXQuY3R4LmRyYXdJbWFnZSh0aGlzLmJsaXR0ZXIuY2FudmFzLCB4LCB5KTtcbiAgfTtcbiAgcmV0dXJuIFBvcFJvb207XG59KCkpOyIsInZhciBpZCwgbG9nLCBtaW4sIG1heCwgZmxvb3IsIHJvdW5kLCBzaW4sIGNvcywgdGF1LCBmbGlwLCBkZWxheSwgZXZlcnksIGRpdiwgcmFuZG9tLCByYW5kb21Gcm9tLCByZXZlcnNlLCBrZXlzLCB2YWx1ZXMsIGdyb3VwQnksIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5taW4gPSBtaW4gPSBNYXRoLm1pbjtcbm91dCQubWF4ID0gbWF4ID0gTWF0aC5tYXg7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yb3VuZCA9IHJvdW5kID0gTWF0aC5yb3VuZDtcbm91dCQuc2luID0gc2luID0gTWF0aC5zaW47XG5vdXQkLmNvcyA9IGNvcyA9IE1hdGguY29zO1xub3V0JC50YXUgPSB0YXUgPSBNYXRoLlBJICogMjtcbm91dCQuZmxpcCA9IGZsaXAgPSBmdW5jdGlvbijOuyl7XG4gIHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gzrsoYiwgYSk7XG4gIH07XG59O1xub3V0JC5kZWxheSA9IGRlbGF5ID0gZmxpcChzZXRUaW1lb3V0KTtcbm91dCQuZXZlcnkgPSBldmVyeSA9IGZsaXAoc2V0SW50ZXJ2YWwpO1xub3V0JC5kaXYgPSBkaXYgPSBjdXJyeSQoZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBmbG9vcihhIC8gYik7XG59KTtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gTWF0aC5yYW5kb20oKSAqIGl0O1xufTtcbm91dCQucmFuZG9tRnJvbSA9IHJhbmRvbUZyb20gPSBmdW5jdGlvbihsaXN0KXtcbiAgcmV0dXJuIGxpc3RbZmxvb3IocmFuZG9tKGxpc3QubGVuZ3RoIC0gMSkpXTtcbn07XG5vdXQkLnJldmVyc2UgPSByZXZlcnNlID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQucmV2ZXJzZSgpO1xufTtcbm91dCQua2V5cyA9IGtleXMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBrLCB2LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGsgaW4gaXQpIHtcbiAgICB2ID0gaXRba107XG4gICAgcmVzdWx0cyQucHVzaChrKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC52YWx1ZXMgPSB2YWx1ZXMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBrLCB2LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGsgaW4gaXQpIHtcbiAgICB2ID0gaXRba107XG4gICAgcmVzdWx0cyQucHVzaCh2KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC5ncm91cEJ5ID0gZ3JvdXBCeSA9IGZ1bmN0aW9uKM67LCBsaXN0KXtcbiAgdmFyIG8sIGkkLCBsZW4kLCB4LCBrZXkkO1xuICBvID0ge307XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbGlzdC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsaXN0W2kkXTtcbiAgICAob1trZXkkID0gzrsoeCldIHx8IChvW2tleSRdID0gW10pKS5wdXNoKHgpO1xuICB9XG4gIHJldHVybiBvO1xufTtcbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSJdfQ==
