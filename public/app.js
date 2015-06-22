(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, id, log, keys, randomFrom, delay, every, Assets, PopLevel, levelData, xhr;
ref$ = require('std'), id = ref$.id, log = ref$.log, keys = ref$.keys, randomFrom = ref$.randomFrom, delay = ref$.delay, every = ref$.every;
Assets = require('./assets').Assets;
PopLevel = require('./level').PopLevel;
levelData = {};
xhr = new XMLHttpRequest;
xhr.open('GET', "levels/01.plv", true);
xhr.responseType = 'arraybuffer';
xhr.send();
xhr.onload = function(){
  var zx, zy, zz, canvas, ctx, colors, loadImg, none, wall, torch, floor, pillar, debris, unstable, gate, plate, red, slam, spikes, exitLeft, exitRight, skeleton, sword, getRoomOffsets, drawNeighbour, drawRoomWithNeighbours, drawRoom, drawRoomTiles, pan, lastMouse, dragging;
  levelData = new PopLevel(this.response);
  zx = 32;
  zy = 63;
  zz = 10;
  canvas = document.createElement('canvas');
  canvas.width = 10 * zx;
  canvas.height = 3 * zy + 2;
  ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = "16px monospace";
  colors = ['black', 'black', 'red', 'darkcyan', 'yellow', 'green', 'blue', 'cyan', 'purple', 'pink', 'white', 'black', 'red', 'purple', 'grey', 'green', 'blue', 'cyan', 'pink', 'orange', 'cyan', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'purple', 'pink'];
  loadImg = function(src){
    var i;
    i = new Image;
    i.src = '/tiles/' + src + '.png';
    return i;
  };
  none = {};
  wall = loadImg('wall');
  torch = loadImg('torch');
  floor = loadImg('floor');
  pillar = loadImg('pillars');
  debris = loadImg('debris');
  unstable = loadImg('unstable');
  gate = loadImg('gate');
  plate = loadImg('plate');
  red = loadImg('potion-red');
  slam = loadImg('slam');
  spikes = loadImg('spikes');
  exitLeft = loadImg('exit-left');
  exitRight = loadImg('exit-right');
  skeleton = loadImg('skeleton');
  sword = loadImg('sword');
  getRoomOffsets = function(it){
    switch (it) {
    case 'up':
      return {
        x: 0,
        y: zy * -3
      };
    case 'down':
      return {
        x: 0,
        y: zy * 3
      };
    case 'left':
      return {
        x: zx * -10,
        y: 0
      };
    case 'right':
      return {
        x: zx * 10,
        y: 0
      };
    }
  };
  drawNeighbour = function(links, dir, ox, oy){
    var that, ref$, x, y;
    if (that = links[dir]) {
      ref$ = getRoomOffsets(dir), x = ref$.x, y = ref$.y;
      return drawRoom(that, ox + x, oy + y);
    }
  };
  drawRoomWithNeighbours = function(room, ox, oy){
    var links;
    ctx.clearRect(0, 0, 400, 400);
    links = levelData.links[room];
    drawNeighbour(links, 'down', ox, oy);
    drawNeighbour(links, 'left', ox, oy);
    drawRoom(room, ox, oy);
    drawNeighbour(links, 'right', ox, oy);
    return drawNeighbour(links, 'up', ox, oy);
  };
  drawRoom = function(room, ox, oy){
    var tiles;
    log("Draw room:", room, "at", ox, oy);
    tiles = levelData.rooms[room].foretiles;
    return drawRoomTiles(tiles, ox, oy);
  };
  drawRoomTiles = function(tileRows, ox, oy){
    var i$, rowIx, lresult$, row, j$, len$, tile, image, results$ = [];
    for (i$ = 2; i$ >= 0; --i$) {
      rowIx = i$;
      lresult$ = [];
      row = tileRows[rowIx];
      for (j$ = 0, len$ = row.length; j$ < len$; ++j$) {
        tile = row[j$];
        image = (fn$());
        if (image === none) {
          lresult$.push(void 8);
        } else if (image) {
          lresult$.push(ctx.drawImage(image, tile.x * zx + ox, tile.y * zy - zz + oy));
        } else {
          ctx.fillStyle = 'white';
          ctx.strokeText(tile.code.toString(16), tile.x * zx + zx + ox, tile.y * zy + zy * 0.7 + oy);
          lresult$.push(ctx.fillText(tile.code.toString(16), tile.x * zx + zx + ox, tile.y * zy + zy * 0.7 + oy));
        }
      }
      results$.push(lresult$);
    }
    return results$;
    function fn$(){
      switch (tile.name) {
      case "Empty":
        return none;
      case "Torch":
        return torch;
      case "Spikes":
        return spikes;
      case "Wall":
        return wall;
      case "Floor":
        return floor;
      case "Pillar":
        return pillar;
      case "Debris":
        return debris;
      case "Loose Board":
        return unstable;
      case "Gate":
        return gate;
      case "Potion":
        return red;
      case "Raise Button":
        return plate;
      case "Drop Button":
        return slam;
      case "Exit Left":
        return exitLeft;
      case "Exit Right":
        return exitRight;
      case "Skeleton":
        return skeleton;
      case "Sword":
        return sword;
      default:
        return null;
      }
    }
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
  canvas.addEventListener('mousedown', function(){
    return dragging = true;
  });
  canvas.addEventListener('mouseup', function(){
    return dragging = false;
  });
  canvas.addEventListener('mousemove', function(event){
    var Δx, Δy;
    Δx = lastMouse.x - event.offsetX;
    Δy = lastMouse.y - event.offsetY;
    lastMouse.x = event.offsetX;
    lastMouse.y = event.offsetY;
    if (dragging) {
      log('dragging');
      pan.x -= Δx;
      pan.y -= Δy;
      return drawRoomWithNeighbours(levelData.start.room, pan.x, pan.y);
    }
  });
  return delay(100, function(){
    return drawRoomWithNeighbours(levelData.start.room, pan.x, pan.y);
  });
};
},{"./assets":2,"./level":4,"std":6}],2:[function(require,module,exports){
var ref$, id, log, Assets, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Assets = Assets = {
  graphics: ["/tiles/vdungeon/res230.png", "/tiles/vdungeon/res231.png", "/tiles/vdungeon/res232.png", "/tiles/vdungeon/res233.png", "/tiles/vdungeon/res234.png", "/tiles/vdungeon/res235.png", "/tiles/vdungeon/res236.png", "/tiles/vdungeon/res237.png", "/tiles/vdungeon/res238.png", "/tiles/vdungeon/res239.png", "/tiles/vdungeon/res240.png", "/tiles/vdungeon/res241.png", "/tiles/vdungeon/res242.png", "/tiles/vdungeon/res243.png", "/tiles/vdungeon/res244.png", "/tiles/vdungeon/res245.png", "/tiles/vdungeon/res246.png", "/tiles/vdungeon/res247.png", "/tiles/vdungeon/res248.png", "/tiles/vdungeon/res249.png", "/tiles/vdungeon/res250.png", "/tiles/vdungeon/res251.png", "/tiles/vdungeon/res252.png", "/tiles/vdungeon/res253.png", "/tiles/vdungeon/res254.png", "/tiles/vdungeon/res255.png", "/tiles/vdungeon/res256.png", "/tiles/vdungeon/res257.png", "/tiles/vdungeon/res258.png", "/tiles/vdungeon/res259.png", "/tiles/vdungeon/res260.png", "/tiles/vdungeon/res261.png", "/tiles/vdungeon/res262.png", "/tiles/vdungeon/res263.png", "/tiles/vdungeon/res264.png", "/tiles/vdungeon/res265.png", "/tiles/vdungeon/res266.png", "/tiles/vdungeon/res267.png", "/tiles/vdungeon/res268.png", "/tiles/vdungeon/res269.png", "/tiles/vdungeon/res270.png", "/tiles/vdungeon/res271.png", "/tiles/vdungeon/res272.png", "/tiles/vdungeon/res273.png", "/tiles/vdungeon/res274.png", "/tiles/vdungeon/res285.png", "/tiles/vdungeon/res286.png", "/tiles/vdungeon/res287.png", "/tiles/vdungeon/res288.png", "/tiles/vdungeon/res289.png", "/tiles/vdungeon/res290.png", "/tiles/vdungeon/res291.png", "/tiles/vdungeon/res292.png", "/tiles/vdungeon/res293.png", "/tiles/vdungeon/res294.png", "/tiles/vdungeon/res295.png", "/tiles/vdungeon/res296.png", "/tiles/vdungeon/res297.png", "/tiles/vdungeon/res298.png", "/tiles/vdungeon/res299.png", "/tiles/vdungeon/res300.png", "/tiles/vdungeon/res301.png", "/tiles/vdungeon/res302.png", "/tiles/vdungeon/res303.png", "/tiles/vdungeon/res304.png", "/tiles/vdungeon/res305.png", "/tiles/vdungeon/res306.png", "/tiles/vdungeon/res307.png", "/tiles/vdungeon/res308.png", "/tiles/vdungeon/res309.png", "/tiles/vdungeon/res310.png", "/tiles/vdungeon/res311.png", "/tiles/vdungeon/res312.png", "/tiles/vdungeon/res313.png", "/tiles/vdungeon/res314.png", "/tiles/vdungeon/res315.png", "/tiles/vdungeon/res316.png", "/tiles/vdungeon/res317.png", "/tiles/vdungeon/res318.png", "/tiles/vdungeon/res319.png", "/tiles/vdungeon/res320.png", "/tiles/vdungeon/res321.png", "/tiles/vdungeon/res322.png", "/tiles/vdungeon/res323.png", "/tiles/vdungeon/res324.png", "/tiles/vdungeon/res325.png", "/tiles/vdungeon/res326.png", "/tiles/vdungeon/res327.png", "/tiles/vdungeon/res328.png", "/tiles/vdungeon/res329.png", "/tiles/vdungeon/res330.png", "/tiles/vdungeon/res331.png", "/tiles/vdungeon/res332.png", "/tiles/vdungeon/res333.png", "/tiles/vdungeon/res334.png", "/tiles/vdungeon/res335.png", "/tiles/vdungeon/res336.png", "/tiles/vdungeon/res337.png", "/tiles/vdungeon/res338.png", "/tiles/vdungeon/res339.png", "/tiles/vdungeon/res340.png", "/tiles/vdungeon/res341.png", "/tiles/vdungeon/res342.png", "/tiles/vdungeon/res343.png", "/tiles/vdungeon/res344.png", "/tiles/vdungeon/res346.png", "/tiles/vdungeon/res347.png", "/tiles/vdungeon/res348.png", "/tiles/vdungeon/res349.png", "/tiles/vdungeon/res350.png", "/tiles/vdungeon/res351.png", "/tiles/vdungeon/res361.png", "/tiles/vdungeon/res362.png", "/tiles/vdungeon/res363.png", "/tiles/vdungeon/res364.png", "/tiles/vdungeon/res365.png", "/tiles/vdungeon/res366.png", "/tiles/vdungeon/res367.png", "/tiles/vdungeon/res368.png", "/tiles/vdungeon/res369.png", "/tiles/vdungeon/res370.png", "/tiles/vdungeon/res371.png", "/tiles/vdungeon/res372.png", "/tiles/vdungeon/res373.png", "/tiles/vdungeon/res374.png", "/tiles/vdungeon/res375.png", "/tiles/vdungeon/res376.png", "/tiles/vdungeon/res377.png"]
};
},{"std":6}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
      res$.push(new PopRoom(buffer.subarray(startIndex, endIndex)));
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
},{"./room":5,"std":6}],5:[function(require,module,exports){
var ref$, id, log, div, ForeTile, PopRoom, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, div = ref$.div;
ForeTile = require('./foretile').ForeTile;
out$.PopRoom = PopRoom = (function(){
  PopRoom.displayName = 'PopRoom';
  var POP_ROOM_SIZE, prototype = PopRoom.prototype, constructor = PopRoom;
  POP_ROOM_SIZE = 30;
  function PopRoom(forebuffer, backbuffer){
    var i$, to$, i, x, y;
    this.forebuffer = forebuffer;
    this.backbuffer = backbuffer;
    this.foretiles = [[], [], []];
    this.backtiles = [[], [], []];
    for (i$ = 0, to$ = POP_ROOM_SIZE; i$ < to$; ++i$) {
      i = i$;
      x = i % 10;
      y = div(i, 10);
      this.foretiles[y][x] = new ForeTile(this.forebuffer[i], x, y);
    }
  }
  return PopRoom;
}());
},{"./foretile":3,"std":6}],6:[function(require,module,exports){
var id, log, min, max, floor, round, sin, cos, tau, flip, delay, every, keys, div, random, randomFrom, out$ = typeof exports != 'undefined' && exports || this;
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
out$.keys = keys = function(it){
  var k, v, results$ = [];
  for (k in it) {
    v = it[k];
    results$.push(k);
  }
  return results$;
};
out$.div = div = curry$(function(a, b){
  return floor(a / b);
});
out$.random = random = function(it){
  return Math.random() * it;
};
out$.randomFrom = randomFrom = function(list){
  return list[floor(random(list.length - 1))];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2Fzc2V0cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2xldmVsL2ZvcmV0aWxlLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbGV2ZWwvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9sZXZlbC9yb29tLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvc3RkL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlZiQsIGlkLCBsb2csIGtleXMsIHJhbmRvbUZyb20sIGRlbGF5LCBldmVyeSwgQXNzZXRzLCBQb3BMZXZlbCwgbGV2ZWxEYXRhLCB4aHI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGtleXMgPSByZWYkLmtleXMsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb20sIGRlbGF5ID0gcmVmJC5kZWxheSwgZXZlcnkgPSByZWYkLmV2ZXJ5O1xuQXNzZXRzID0gcmVxdWlyZSgnLi9hc3NldHMnKS5Bc3NldHM7XG5Qb3BMZXZlbCA9IHJlcXVpcmUoJy4vbGV2ZWwnKS5Qb3BMZXZlbDtcbmxldmVsRGF0YSA9IHt9O1xueGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xueGhyLm9wZW4oJ0dFVCcsIFwibGV2ZWxzLzAxLnBsdlwiLCB0cnVlKTtcbnhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xueGhyLnNlbmQoKTtcbnhoci5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICB2YXIgengsIHp5LCB6eiwgY2FudmFzLCBjdHgsIGNvbG9ycywgbG9hZEltZywgbm9uZSwgd2FsbCwgdG9yY2gsIGZsb29yLCBwaWxsYXIsIGRlYnJpcywgdW5zdGFibGUsIGdhdGUsIHBsYXRlLCByZWQsIHNsYW0sIHNwaWtlcywgZXhpdExlZnQsIGV4aXRSaWdodCwgc2tlbGV0b24sIHN3b3JkLCBnZXRSb29tT2Zmc2V0cywgZHJhd05laWdoYm91ciwgZHJhd1Jvb21XaXRoTmVpZ2hib3VycywgZHJhd1Jvb20sIGRyYXdSb29tVGlsZXMsIHBhbiwgbGFzdE1vdXNlLCBkcmFnZ2luZztcbiAgbGV2ZWxEYXRhID0gbmV3IFBvcExldmVsKHRoaXMucmVzcG9uc2UpO1xuICB6eCA9IDMyO1xuICB6eSA9IDYzO1xuICB6eiA9IDEwO1xuICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLndpZHRoID0gMTAgKiB6eDtcbiAgY2FudmFzLmhlaWdodCA9IDMgKiB6eSArIDI7XG4gIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICBjdHguZm9udCA9IFwiMTZweCBtb25vc3BhY2VcIjtcbiAgY29sb3JzID0gWydibGFjaycsICdibGFjaycsICdyZWQnLCAnZGFya2N5YW4nLCAneWVsbG93JywgJ2dyZWVuJywgJ2JsdWUnLCAnY3lhbicsICdwdXJwbGUnLCAncGluaycsICd3aGl0ZScsICdibGFjaycsICdyZWQnLCAncHVycGxlJywgJ2dyZXknLCAnZ3JlZW4nLCAnYmx1ZScsICdjeWFuJywgJ3BpbmsnLCAnb3JhbmdlJywgJ2N5YW4nLCAnYmxhY2snLCAncmVkJywgJ29yYW5nZScsICd5ZWxsb3cnLCAnZ3JlZW4nLCAnYmx1ZScsICdjeWFuJywgJ3B1cnBsZScsICdwaW5rJ107XG4gIGxvYWRJbWcgPSBmdW5jdGlvbihzcmMpe1xuICAgIHZhciBpO1xuICAgIGkgPSBuZXcgSW1hZ2U7XG4gICAgaS5zcmMgPSAnL3RpbGVzLycgKyBzcmMgKyAnLnBuZyc7XG4gICAgcmV0dXJuIGk7XG4gIH07XG4gIG5vbmUgPSB7fTtcbiAgd2FsbCA9IGxvYWRJbWcoJ3dhbGwnKTtcbiAgdG9yY2ggPSBsb2FkSW1nKCd0b3JjaCcpO1xuICBmbG9vciA9IGxvYWRJbWcoJ2Zsb29yJyk7XG4gIHBpbGxhciA9IGxvYWRJbWcoJ3BpbGxhcnMnKTtcbiAgZGVicmlzID0gbG9hZEltZygnZGVicmlzJyk7XG4gIHVuc3RhYmxlID0gbG9hZEltZygndW5zdGFibGUnKTtcbiAgZ2F0ZSA9IGxvYWRJbWcoJ2dhdGUnKTtcbiAgcGxhdGUgPSBsb2FkSW1nKCdwbGF0ZScpO1xuICByZWQgPSBsb2FkSW1nKCdwb3Rpb24tcmVkJyk7XG4gIHNsYW0gPSBsb2FkSW1nKCdzbGFtJyk7XG4gIHNwaWtlcyA9IGxvYWRJbWcoJ3NwaWtlcycpO1xuICBleGl0TGVmdCA9IGxvYWRJbWcoJ2V4aXQtbGVmdCcpO1xuICBleGl0UmlnaHQgPSBsb2FkSW1nKCdleGl0LXJpZ2h0Jyk7XG4gIHNrZWxldG9uID0gbG9hZEltZygnc2tlbGV0b24nKTtcbiAgc3dvcmQgPSBsb2FkSW1nKCdzd29yZCcpO1xuICBnZXRSb29tT2Zmc2V0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgICBzd2l0Y2ggKGl0KSB7XG4gICAgY2FzZSAndXAnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogenkgKiAtM1xuICAgICAgfTtcbiAgICBjYXNlICdkb3duJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IHp5ICogM1xuICAgICAgfTtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHp4ICogLTEwLFxuICAgICAgICB5OiAwXG4gICAgICB9O1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6IHp4ICogMTAsXG4gICAgICAgIHk6IDBcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICBkcmF3TmVpZ2hib3VyID0gZnVuY3Rpb24obGlua3MsIGRpciwgb3gsIG95KXtcbiAgICB2YXIgdGhhdCwgcmVmJCwgeCwgeTtcbiAgICBpZiAodGhhdCA9IGxpbmtzW2Rpcl0pIHtcbiAgICAgIHJlZiQgPSBnZXRSb29tT2Zmc2V0cyhkaXIpLCB4ID0gcmVmJC54LCB5ID0gcmVmJC55O1xuICAgICAgcmV0dXJuIGRyYXdSb29tKHRoYXQsIG94ICsgeCwgb3kgKyB5KTtcbiAgICB9XG4gIH07XG4gIGRyYXdSb29tV2l0aE5laWdoYm91cnMgPSBmdW5jdGlvbihyb29tLCBveCwgb3kpe1xuICAgIHZhciBsaW5rcztcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDQwMCwgNDAwKTtcbiAgICBsaW5rcyA9IGxldmVsRGF0YS5saW5rc1tyb29tXTtcbiAgICBkcmF3TmVpZ2hib3VyKGxpbmtzLCAnZG93bicsIG94LCBveSk7XG4gICAgZHJhd05laWdoYm91cihsaW5rcywgJ2xlZnQnLCBveCwgb3kpO1xuICAgIGRyYXdSb29tKHJvb20sIG94LCBveSk7XG4gICAgZHJhd05laWdoYm91cihsaW5rcywgJ3JpZ2h0Jywgb3gsIG95KTtcbiAgICByZXR1cm4gZHJhd05laWdoYm91cihsaW5rcywgJ3VwJywgb3gsIG95KTtcbiAgfTtcbiAgZHJhd1Jvb20gPSBmdW5jdGlvbihyb29tLCBveCwgb3kpe1xuICAgIHZhciB0aWxlcztcbiAgICBsb2coXCJEcmF3IHJvb206XCIsIHJvb20sIFwiYXRcIiwgb3gsIG95KTtcbiAgICB0aWxlcyA9IGxldmVsRGF0YS5yb29tc1tyb29tXS5mb3JldGlsZXM7XG4gICAgcmV0dXJuIGRyYXdSb29tVGlsZXModGlsZXMsIG94LCBveSk7XG4gIH07XG4gIGRyYXdSb29tVGlsZXMgPSBmdW5jdGlvbih0aWxlUm93cywgb3gsIG95KXtcbiAgICB2YXIgaSQsIHJvd0l4LCBscmVzdWx0JCwgcm93LCBqJCwgbGVuJCwgdGlsZSwgaW1hZ2UsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDI7IGkkID49IDA7IC0taSQpIHtcbiAgICAgIHJvd0l4ID0gaSQ7XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgcm93ID0gdGlsZVJvd3Nbcm93SXhdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbiQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbiQ7ICsraiQpIHtcbiAgICAgICAgdGlsZSA9IHJvd1tqJF07XG4gICAgICAgIGltYWdlID0gKGZuJCgpKTtcbiAgICAgICAgaWYgKGltYWdlID09PSBub25lKSB7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh2b2lkIDgpO1xuICAgICAgICB9IGVsc2UgaWYgKGltYWdlKSB7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChjdHguZHJhd0ltYWdlKGltYWdlLCB0aWxlLnggKiB6eCArIG94LCB0aWxlLnkgKiB6eSAtIHp6ICsgb3kpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgICBjdHguc3Ryb2tlVGV4dCh0aWxlLmNvZGUudG9TdHJpbmcoMTYpLCB0aWxlLnggKiB6eCArIHp4ICsgb3gsIHRpbGUueSAqIHp5ICsgenkgKiAwLjcgKyBveSk7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChjdHguZmlsbFRleHQodGlsZS5jb2RlLnRvU3RyaW5nKDE2KSwgdGlsZS54ICogenggKyB6eCArIG94LCB0aWxlLnkgKiB6eSArIHp5ICogMC43ICsgb3kpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgICBmdW5jdGlvbiBmbiQoKXtcbiAgICAgIHN3aXRjaCAodGlsZS5uYW1lKSB7XG4gICAgICBjYXNlIFwiRW1wdHlcIjpcbiAgICAgICAgcmV0dXJuIG5vbmU7XG4gICAgICBjYXNlIFwiVG9yY2hcIjpcbiAgICAgICAgcmV0dXJuIHRvcmNoO1xuICAgICAgY2FzZSBcIlNwaWtlc1wiOlxuICAgICAgICByZXR1cm4gc3Bpa2VzO1xuICAgICAgY2FzZSBcIldhbGxcIjpcbiAgICAgICAgcmV0dXJuIHdhbGw7XG4gICAgICBjYXNlIFwiRmxvb3JcIjpcbiAgICAgICAgcmV0dXJuIGZsb29yO1xuICAgICAgY2FzZSBcIlBpbGxhclwiOlxuICAgICAgICByZXR1cm4gcGlsbGFyO1xuICAgICAgY2FzZSBcIkRlYnJpc1wiOlxuICAgICAgICByZXR1cm4gZGVicmlzO1xuICAgICAgY2FzZSBcIkxvb3NlIEJvYXJkXCI6XG4gICAgICAgIHJldHVybiB1bnN0YWJsZTtcbiAgICAgIGNhc2UgXCJHYXRlXCI6XG4gICAgICAgIHJldHVybiBnYXRlO1xuICAgICAgY2FzZSBcIlBvdGlvblwiOlxuICAgICAgICByZXR1cm4gcmVkO1xuICAgICAgY2FzZSBcIlJhaXNlIEJ1dHRvblwiOlxuICAgICAgICByZXR1cm4gcGxhdGU7XG4gICAgICBjYXNlIFwiRHJvcCBCdXR0b25cIjpcbiAgICAgICAgcmV0dXJuIHNsYW07XG4gICAgICBjYXNlIFwiRXhpdCBMZWZ0XCI6XG4gICAgICAgIHJldHVybiBleGl0TGVmdDtcbiAgICAgIGNhc2UgXCJFeGl0IFJpZ2h0XCI6XG4gICAgICAgIHJldHVybiBleGl0UmlnaHQ7XG4gICAgICBjYXNlIFwiU2tlbGV0b25cIjpcbiAgICAgICAgcmV0dXJuIHNrZWxldG9uO1xuICAgICAgY2FzZSBcIlN3b3JkXCI6XG4gICAgICAgIHJldHVybiBzd29yZDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcGFuID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuICBsYXN0TW91c2UgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH07XG4gIGRyYWdnaW5nID0gZmFsc2U7XG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmFnZ2luZyA9IHRydWU7XG4gIH0pO1xuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRyYWdnaW5nID0gZmFsc2U7XG4gIH0pO1xuICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpe1xuICAgIHZhciDOlHgsIM6UeTtcbiAgICDOlHggPSBsYXN0TW91c2UueCAtIGV2ZW50Lm9mZnNldFg7XG4gICAgzpR5ID0gbGFzdE1vdXNlLnkgLSBldmVudC5vZmZzZXRZO1xuICAgIGxhc3RNb3VzZS54ID0gZXZlbnQub2Zmc2V0WDtcbiAgICBsYXN0TW91c2UueSA9IGV2ZW50Lm9mZnNldFk7XG4gICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICBsb2coJ2RyYWdnaW5nJyk7XG4gICAgICBwYW4ueCAtPSDOlHg7XG4gICAgICBwYW4ueSAtPSDOlHk7XG4gICAgICByZXR1cm4gZHJhd1Jvb21XaXRoTmVpZ2hib3VycyhsZXZlbERhdGEuc3RhcnQucm9vbSwgcGFuLngsIHBhbi55KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZGVsYXkoMTAwLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkcmF3Um9vbVdpdGhOZWlnaGJvdXJzKGxldmVsRGF0YS5zdGFydC5yb29tLCBwYW4ueCwgcGFuLnkpO1xuICB9KTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIEFzc2V0cywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbm91dCQuQXNzZXRzID0gQXNzZXRzID0ge1xuICBncmFwaGljczogW1wiL3RpbGVzL3ZkdW5nZW9uL3JlczIzMC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjMxLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyMzIucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczIzMy5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjM0LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyMzUucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczIzNi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjM3LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyMzgucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczIzOS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjQwLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNDEucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI0Mi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjQzLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNDQucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI0NS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjQ2LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNDcucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI0OC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjQ5LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNTAucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI1MS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjUyLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNTMucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI1NC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjU1LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNTYucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI1Ny5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjU4LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNTkucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI2MC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjYxLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNjIucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI2My5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjY0LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNjUucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI2Ni5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjY3LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNjgucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI2OS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjcwLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNzEucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI3Mi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjczLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyNzQucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI4NS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjg2LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyODcucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI4OC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjg5LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyOTAucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI5MS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjkyLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyOTMucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI5NC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjk1LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyOTYucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczI5Ny5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMjk4LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMyOTkucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMwMC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzAxLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMDIucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMwMy5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzA0LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMDUucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMwNi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzA3LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMDgucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMwOS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzEwLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMTEucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMxMi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzEzLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMTQucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMxNS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzE2LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMTcucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMxOC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzE5LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMjAucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMyMS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzIyLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMjMucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMyNC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzI1LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMjYucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMyNy5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzI4LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMjkucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMzMC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzMxLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMzIucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMzMy5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzM0LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMzUucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMzNi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzM3LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzMzgucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczMzOS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzQwLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNDEucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM0Mi5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzQzLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNDQucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM0Ni5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzQ3LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNDgucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM0OS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzUwLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNTEucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM2MS5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzYyLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNjMucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM2NC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzY1LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNjYucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM2Ny5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzY4LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNjkucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM3MC5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzcxLnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNzIucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM3My5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzc0LnBuZ1wiLCBcIi90aWxlcy92ZHVuZ2Vvbi9yZXMzNzUucG5nXCIsIFwiL3RpbGVzL3ZkdW5nZW9uL3JlczM3Ni5wbmdcIiwgXCIvdGlsZXMvdmR1bmdlb24vcmVzMzc3LnBuZ1wiXVxufTsiLCJ2YXIgRm9yZVRpbGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLkZvcmVUaWxlID0gRm9yZVRpbGUgPSAoZnVuY3Rpb24oKXtcbiAgRm9yZVRpbGUuZGlzcGxheU5hbWUgPSAnRm9yZVRpbGUnO1xuICB2YXIgZm9yZXRhYmxlVGlsZVR5cGVzLCBwcm90b3R5cGUgPSBGb3JlVGlsZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRm9yZVRpbGU7XG4gIGZvcmV0YWJsZVRpbGVUeXBlcyA9IFtcbiAgICB7XG4gICAgICBjb2RlOiAweDAwLFxuICAgICAgZ3JvdXA6ICdmcmVlJyxcbiAgICAgIG5hbWU6IFwiRW1wdHlcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDEsXG4gICAgICBncm91cDogJ2ZyZWUnLFxuICAgICAgbmFtZTogXCJGbG9vclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMixcbiAgICAgIGdyb3VwOiAnc3Bpa2UnLFxuICAgICAgbmFtZTogXCJTcGlrZXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDMsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJQaWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDQsXG4gICAgICBncm91cDogJ2dhdGUnLFxuICAgICAgbmFtZTogXCJHYXRlXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA1LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU3R1Y2sgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA2LFxuICAgICAgZ3JvdXA6ICdldmVudCcsXG4gICAgICBuYW1lOiBcIkRyb3AgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA3LFxuICAgICAgZ3JvdXA6ICd0YXBlc3QnLFxuICAgICAgbmFtZTogXCJUYXBlc3RyeVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwOCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJvdHRvbSBCaWctcGlsbGFyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA5LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9wIEJpZy1waWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEEsXG4gICAgICBncm91cDogJ3BvdGlvbicsXG4gICAgICBuYW1lOiBcIlBvdGlvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwQixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxvb3NlIEJvYXJkXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBDLFxuICAgICAgZ3JvdXA6ICd0dG9wJyxcbiAgICAgIG5hbWU6IFwiVGFwZXN0cnkgVG9wXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBELFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTWlycm9yXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBFLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRGVicmlzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBGLFxuICAgICAgZ3JvdXA6ICdldmVudCcsXG4gICAgICBuYW1lOiBcIlJhaXNlIEJ1dHRvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkV4aXQgTGVmdFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkV4aXQgUmlnaHRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTIsXG4gICAgICBncm91cDogJ2Nob21wJyxcbiAgICAgIG5hbWU6IFwiQ2hvcHBlclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcmNoXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE0LFxuICAgICAgZ3JvdXA6ICd3YWxsJyxcbiAgICAgIG5hbWU6IFwiV2FsbFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlNrZWxldG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE2LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU3dvcmRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTcsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCYWxjb255IExlZnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTgsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCYWxjb255IFJpZ2h0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE5LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBQaWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUEsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFN1cHBvcnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUIsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTbWFsbCBMYXR0aWNlXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFDLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBMZWZ0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFELFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBSaWdodFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxRSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcmNoIHdpdGggRGVicmlzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFGLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTnVsbFwiXG4gICAgfVxuICBdO1xuICBmdW5jdGlvbiBGb3JlVGlsZShieXRlLCB4LCB5KXtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLmJ5dGUgPSBieXRlO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICBkYXRhID0gZm9yZXRhYmxlVGlsZVR5cGVzW3RoaXMuYnl0ZSAmIDB4MUZdO1xuICAgIGltcG9ydCQodGhpcywgZGF0YSk7XG4gICAgdGhpcy5tb2RpZmllZCA9ICh0aGlzLmJ5dGUgJiAweDIwKSA+PiA1O1xuICB9XG4gIHJldHVybiBGb3JlVGlsZTtcbn0oKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBkaXYsIFBvcFJvb20sIFBvcExldmVsLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkaXYgPSByZWYkLmRpdjtcblBvcFJvb20gPSByZXF1aXJlKCcuL3Jvb20nKS5Qb3BSb29tO1xub3V0JC5Qb3BMZXZlbCA9IFBvcExldmVsID0gKGZ1bmN0aW9uKCl7XG4gIFBvcExldmVsLmRpc3BsYXlOYW1lID0gJ1BvcExldmVsJztcbiAgdmFyIFBPUF9ST09NX1NJWkUsIFBPUF9MSU5LX1NJWkUsIFBPUF9QUkVBTUJMRV9PRkZTRVQsIHNwZWMsIEZBQ0lORywgTElOS0lORywgZ2V0RmFjaW5nLCBzcGVjU2xpY2UsIHByb3RvdHlwZSA9IFBvcExldmVsLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQb3BMZXZlbDtcbiAgUE9QX1JPT01fU0laRSA9IDMwO1xuICBQT1BfTElOS19TSVpFID0gNDtcbiAgUE9QX1BSRUFNQkxFX09GRlNFVCA9IDE4O1xuICBzcGVjID0ge1xuICAgIGZvcmV0YWJsZToge1xuICAgICAgb2Zmc2V0OiAwLFxuICAgICAgbGVuZ3RoOiA3MjBcbiAgICB9LFxuICAgIGJhY2t0YWJsZToge1xuICAgICAgb2Zmc2V0OiA3MjAsXG4gICAgICBsZW5ndGg6IDcyMFxuICAgIH0sXG4gICAgbGlua3M6IHtcbiAgICAgIG9mZnNldDogMTk1MixcbiAgICAgIGxlbmd0aDogOTZcbiAgICB9LFxuICAgIGRvb3JBOiB7XG4gICAgICBvZmZzZXQ6IDE0NDAsXG4gICAgICBsZW5ndGg6IDI1NlxuICAgIH0sXG4gICAgZG9vckI6IHtcbiAgICAgIG9mZnNldDogMTY5NixcbiAgICAgIGxlbmd0aDogMjU2XG4gICAgfSxcbiAgICBzdGFydFBvc2l0aW9uOiB7XG4gICAgICBvZmZzZXQ6IDIxMTIsXG4gICAgICBsZW5ndGg6IDNcbiAgICB9LFxuICAgIGd1YXJkTG9jYXRpb246IHtcbiAgICAgIG9mZnNldDogMjExOSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIGd1YXJkRGlyZWN0aW9uOiB7XG4gICAgICBvZmZzZXQ6IDIxNDMsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICBndWFyZFNraWxsOiB7XG4gICAgICBvZmZzZXQ6IDIyMTUsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICBndWFyZENvbG91cjoge1xuICAgICAgb2Zmc2V0OiAyMjYzLFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjE6IHtcbiAgICAgIG9mZnNldDogMjA0OCxcbiAgICAgIGxlbmd0aDogNjRcbiAgICB9LFxuICAgIHVua25vd24yOiB7XG4gICAgICBvZmZzZXQ6IDIxMTUsXG4gICAgICBsZW5ndGg6IDNcbiAgICB9LFxuICAgIHVua25vd24zOiB7XG4gICAgICBvZmZzZXQ6IDIxMTYsXG4gICAgICBsZW5ndGg6IDFcbiAgICB9LFxuICAgIHVua25vd240YToge1xuICAgICAgb2Zmc2V0OiAyMTY3LFxuICAgICAgbGVuZ3RoOiAyNFxuICAgIH0sXG4gICAgdW5rbm93bjRiOiB7XG4gICAgICBvZmZzZXQ6IDIxOTEsXG4gICAgICBsZW5ndGg6IDI0XG4gICAgfSxcbiAgICB1bmtub3duNGM6IHtcbiAgICAgIG9mZnNldDogMjIzOSxcbiAgICAgIGxlbmd0aDogMjRcbiAgICB9LFxuICAgIHVua25vd240ZDoge1xuICAgICAgb2Zmc2V0OiAyMjg3LFxuICAgICAgbGVuZ3RoOiAxNlxuICAgIH0sXG4gICAgZW5kOiB7XG4gICAgICBvZmZzZXQ6IDIzMDMsXG4gICAgICBsZW5ndGg6IDJcbiAgICB9XG4gIH07XG4gIEZBQ0lORyA9IHtcbiAgICBMRUZUOiBTeW1ib2woXCJGQUNJTkdfTEVGVFwiKSxcbiAgICBSSUdIVDogU3ltYm9sKFwiRkFDSU5HX1JJR0hUXCIpLFxuICAgIFVOS05PV046IFN5bWJvbChcIkZBQ0lOR19VTktOT1dOXCIpXG4gIH07XG4gIExJTktJTkcgPSB7XG4gICAgTEVGVDogMCxcbiAgICBSSUdIVDogMSxcbiAgICBVUDogMixcbiAgICBET1dOOiAzXG4gIH07XG4gIGdldEZhY2luZyA9IGZ1bmN0aW9uKCl7XG4gICAgc3dpdGNoIChmYWxzZSkge1xuICAgIGNhc2UgITA6XG4gICAgICByZXR1cm4gRkFDSU5HLkxFRlQ7XG4gICAgY2FzZSAhMjU1OlxuICAgICAgcmV0dXJuIEZBQ0lORy5SSUdIVDtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIEZBQ0lORy5VTktOT1dOO1xuICAgIH1cbiAgfTtcbiAgc3BlY1NsaWNlID0gZnVuY3Rpb24oYnVmZmVyLCBjaHVuayl7XG4gICAgcmV0dXJuIGJ1ZmZlci5zdWJhcnJheShjaHVuay5vZmZzZXQsIGNodW5rLm9mZnNldCArIGNodW5rLmxlbmd0aCk7XG4gIH07XG4gIGZ1bmN0aW9uIFBvcExldmVsKHJhdyl7XG4gICAgbG9nKFwibmV3IFBvcExldmVsXCIpO1xuICAgIHRoaXMuZnVsbCA9IG5ldyBVaW50OEFycmF5KHJhdyk7XG4gICAgdGhpcy5kYXRhID0gdGhpcy5mdWxsLnN1YmFycmF5KFBPUF9QUkVBTUJMRV9PRkZTRVQgKyAxLCB0aGlzLmZ1bGwubGVuZ3RoIC0gUE9QX1BSRUFNQkxFX09GRlNFVCk7XG4gICAgdGhpcy5yb29tcyA9IHRoaXMuZXh0cmFjdFJvb21zKHRoaXMuZGF0YSk7XG4gICAgdGhpcy5saW5rcyA9IHRoaXMuZXh0cmFjdExpbmtzKHRoaXMuZGF0YSk7XG4gICAgdGhpcy5zdGFydCA9IHRoaXMuZXh0cmFjdFN0YXJ0KHRoaXMuZGF0YSk7XG4gIH1cbiAgcHJvdG90eXBlLmV4dHJhY3RSb29tcyA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIHJvb21zLCByZXMkLCBpJCwgaSwgc3RhcnRJbmRleCwgZW5kSW5kZXg7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSAyNDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgc3RhcnRJbmRleCA9IHNwZWMuZm9yZXRhYmxlLm9mZnNldCArIGkgKiBQT1BfUk9PTV9TSVpFO1xuICAgICAgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgUE9QX1JPT01fU0laRTtcbiAgICAgIHJlcyQucHVzaChuZXcgUG9wUm9vbShidWZmZXIuc3ViYXJyYXkoc3RhcnRJbmRleCwgZW5kSW5kZXgpKSk7XG4gICAgfVxuICAgIHJvb21zID0gcmVzJDtcbiAgICByb29tcy51bnNoaWZ0KFBvcFJvb20uTnVsbFJvb20pO1xuICAgIHJldHVybiByb29tcztcbiAgfTtcbiAgcHJvdG90eXBlLmV4dHJhY3RMaW5rcyA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIGxpbmtzLCByZXMkLCBpJCwgaSwgc3RhcnRJbmRleCwgZW5kSW5kZXgsIGxpbmtEYXRhO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMjQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHN0YXJ0SW5kZXggPSBzcGVjLmxpbmtzLm9mZnNldCArIGkgKiBQT1BfTElOS19TSVpFO1xuICAgICAgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgUE9QX0xJTktfU0laRTtcbiAgICAgIGxpbmtEYXRhID0gYnVmZmVyLnN1YmFycmF5KHN0YXJ0SW5kZXgsIGVuZEluZGV4KTtcbiAgICAgIHJlcyQucHVzaCh7XG4gICAgICAgIHVwOiBsaW5rRGF0YVtMSU5LSU5HLlVQXSxcbiAgICAgICAgZG93bjogbGlua0RhdGFbTElOS0lORy5ET1dOXSxcbiAgICAgICAgbGVmdDogbGlua0RhdGFbTElOS0lORy5MRUZUXSxcbiAgICAgICAgcmlnaHQ6IGxpbmtEYXRhW0xJTktJTkcuUklHSFRdXG4gICAgICB9KTtcbiAgICB9XG4gICAgbGlua3MgPSByZXMkO1xuICAgIGxpbmtzLnVuc2hpZnQoe30pO1xuICAgIHJldHVybiBsaW5rcztcbiAgfTtcbiAgcHJvdG90eXBlLmV4dHJhY3RTdGFydCA9IGZ1bmN0aW9uKGJ1ZmZlcil7XG4gICAgdmFyIGRhdGE7XG4gICAgZGF0YSA9IHNwZWNTbGljZShidWZmZXIsIHNwZWMuc3RhcnRQb3NpdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb206IGRhdGFbMF0sXG4gICAgICB0aWxlOiBkYXRhWzFdLFxuICAgICAgZmFjaW5nOiBnZXRGYWNpbmcoZGF0YVsyXSlcbiAgICB9O1xuICB9O1xuICByZXR1cm4gUG9wTGV2ZWw7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBkaXYsIEZvcmVUaWxlLCBQb3BSb29tLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkaXYgPSByZWYkLmRpdjtcbkZvcmVUaWxlID0gcmVxdWlyZSgnLi9mb3JldGlsZScpLkZvcmVUaWxlO1xub3V0JC5Qb3BSb29tID0gUG9wUm9vbSA9IChmdW5jdGlvbigpe1xuICBQb3BSb29tLmRpc3BsYXlOYW1lID0gJ1BvcFJvb20nO1xuICB2YXIgUE9QX1JPT01fU0laRSwgcHJvdG90eXBlID0gUG9wUm9vbS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUG9wUm9vbTtcbiAgUE9QX1JPT01fU0laRSA9IDMwO1xuICBmdW5jdGlvbiBQb3BSb29tKGZvcmVidWZmZXIsIGJhY2tidWZmZXIpe1xuICAgIHZhciBpJCwgdG8kLCBpLCB4LCB5O1xuICAgIHRoaXMuZm9yZWJ1ZmZlciA9IGZvcmVidWZmZXI7XG4gICAgdGhpcy5iYWNrYnVmZmVyID0gYmFja2J1ZmZlcjtcbiAgICB0aGlzLmZvcmV0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICB0aGlzLmJhY2t0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gUE9QX1JPT01fU0laRTsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHggPSBpICUgMTA7XG4gICAgICB5ID0gZGl2KGksIDEwKTtcbiAgICAgIHRoaXMuZm9yZXRpbGVzW3ldW3hdID0gbmV3IEZvcmVUaWxlKHRoaXMuZm9yZWJ1ZmZlcltpXSwgeCwgeSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBQb3BSb29tO1xufSgpKTsiLCJ2YXIgaWQsIGxvZywgbWluLCBtYXgsIGZsb29yLCByb3VuZCwgc2luLCBjb3MsIHRhdSwgZmxpcCwgZGVsYXksIGV2ZXJ5LCBrZXlzLCBkaXYsIHJhbmRvbSwgcmFuZG9tRnJvbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLm1pbiA9IG1pbiA9IE1hdGgubWluO1xub3V0JC5tYXggPSBtYXggPSBNYXRoLm1heDtcbm91dCQuZmxvb3IgPSBmbG9vciA9IE1hdGguZmxvb3I7XG5vdXQkLnJvdW5kID0gcm91bmQgPSBNYXRoLnJvdW5kO1xub3V0JC5zaW4gPSBzaW4gPSBNYXRoLnNpbjtcbm91dCQuY29zID0gY29zID0gTWF0aC5jb3M7XG5vdXQkLnRhdSA9IHRhdSA9IE1hdGguUEkgKiAyO1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5ldmVyeSA9IGV2ZXJ5ID0gZmxpcChzZXRJbnRlcnZhbCk7XG5vdXQkLmtleXMgPSBrZXlzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaywgdiwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChrIGluIGl0KSB7XG4gICAgdiA9IGl0W2tdO1xuICAgIHJlc3VsdHMkLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuZGl2ID0gZGl2ID0gY3VycnkkKGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gZmxvb3IoYSAvIGIpO1xufSk7XG5vdXQkLnJhbmRvbSA9IHJhbmRvbSA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiBpdDtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W2Zsb29yKHJhbmRvbShsaXN0Lmxlbmd0aCAtIDEpKV07XG59O1xuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
