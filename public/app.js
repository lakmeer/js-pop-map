(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, id, log, keys, levelData, Assets, Renderer, Camera, PopLevel, xhr, canvas, ctx;
ref$ = require('std'), id = ref$.id, log = ref$.log, keys = ref$.keys;
log("POP MAP");
levelData = require('./mock-level-data');
Assets = require('./assets').Assets;
Renderer = require('./renderer').Renderer;
Camera = require('./camera').Camera;
PopLevel = require('./level').PopLevel;
xhr = new XMLHttpRequest;
xhr.open('GET', "levels/01.plv", true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(){
  return new PopLevel(this.response);
};
xhr.send();
canvas = document.createElement('canvas');
ctx = canvas.getContext('2d');
},{"./assets":2,"./camera":3,"./level":5,"./mock-level-data":7,"./renderer":8,"std":9}],2:[function(require,module,exports){
var ref$, id, log, Assets, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Assets = Assets = {};
},{"std":9}],3:[function(require,module,exports){
var ref$, id, log, Camera, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Camera = Camera = {};
},{"std":9}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var ref$, id, log, div, PopRoom, PopLevel, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, div = ref$.div;
PopRoom = require('./room').PopRoom;
out$.PopLevel = PopLevel = (function(){
  PopLevel.displayName = 'PopLevel';
  var POP_ROOM_SIZE, spec, prototype = PopLevel.prototype, constructor = PopLevel;
  POP_ROOM_SIZE = 30;
  spec = {
    foretable: {
      length: 720,
      offset: 0
    },
    backtable: {
      length: 720,
      offset: 720
    },
    doorA: {
      length: 256,
      offset: 1440
    },
    doorB: {
      length: 256,
      offset: 1696
    },
    links: {
      length: 96,
      offset: 1952
    },
    unknown1: {
      length: 64,
      offset: 2048
    },
    startPosition: {
      length: 3,
      offset: 2112
    },
    unknown2: {
      length: 3,
      offset: 2115
    },
    unknown3: {
      length: 1,
      offset: 2116
    },
    guardLocation: {
      length: 24,
      offset: 2119
    },
    guardDirection: {
      length: 24,
      offset: 2143
    },
    unknown4a: {
      length: 24,
      offset: 2167
    },
    unknown4b: {
      length: 24,
      offset: 2191
    },
    guardSkill: {
      length: 24,
      offset: 2215
    },
    unknown4c: {
      length: 24,
      offset: 2239
    },
    guardColour: {
      length: 24,
      offset: 2263
    },
    unknown4d: {
      length: 16,
      offset: 2287
    },
    end: {
      length: 2,
      offset: 2303
    }
  };
  function PopLevel(raw){
    log("new PopLevel");
    this.buffer = new Uint8Array(raw);
    this.rooms = this.extractRoomTiles;
  }
  prototype.extractRoomTiles = function(buffer){
    var rooms, i, startIndex, endIndex;
    return rooms = (function(){
      var i$, results$ = [];
      for (i$ = 0; i$ <= 24; ++i$) {
        i = i$;
        startIndex = spec.foretable.offset + i * POP_ROOM_SIZE;
        endIndex = startIndex + POP_ROOM_SIZE;
        results$.push(new PopRoom(buffer.subarray(startIndex, endIndex)));
      }
      return results$;
    }());
  };
  return PopLevel;
}());
},{"./room":6,"std":9}],6:[function(require,module,exports){
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
      this.foretiles[y][x] = new ForeTile(this.forebuffer[i]);
      this.backtiles[y][x] = new BackTile(this.backbuffer[i]);
    }
  }
  return PopRoom;
}());
},{"./foretile":4,"std":9}],7:[function(require,module,exports){
var ref$, id, log, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
log("Mock Level Data");
ref$ = out$;
ref$[0] = 0;
ref$[1] = 0;
ref$[2] = 0;
ref$[3] = 0;
},{"std":9}],8:[function(require,module,exports){
var ref$, id, log, Renderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Renderer = Renderer = {};
},{"std":9}],9:[function(require,module,exports){
var id, log, min, max, floor, round, sin, cos, tau, flip, delay, keys, div, out$ = typeof exports != 'undefined' && exports || this;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2Fzc2V0cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2NhbWVyYS9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL2pzLXBvcC1tYXAvc3JjL2xldmVsL2ZvcmV0aWxlLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbGV2ZWwvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9sZXZlbC9yb29tLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvbW9jay1sZXZlbC1kYXRhLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvanMtcG9wLW1hcC9zcmMvcmVuZGVyZXIvaW5kZXgubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy9qcy1wb3AtbWFwL3NyYy9zdGQvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlZiQsIGlkLCBsb2csIGtleXMsIGxldmVsRGF0YSwgQXNzZXRzLCBSZW5kZXJlciwgQ2FtZXJhLCBQb3BMZXZlbCwgeGhyLCBjYW52YXMsIGN0eDtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywga2V5cyA9IHJlZiQua2V5cztcbmxvZyhcIlBPUCBNQVBcIik7XG5sZXZlbERhdGEgPSByZXF1aXJlKCcuL21vY2stbGV2ZWwtZGF0YScpO1xuQXNzZXRzID0gcmVxdWlyZSgnLi9hc3NldHMnKS5Bc3NldHM7XG5SZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKS5SZW5kZXJlcjtcbkNhbWVyYSA9IHJlcXVpcmUoJy4vY2FtZXJhJykuQ2FtZXJhO1xuUG9wTGV2ZWwgPSByZXF1aXJlKCcuL2xldmVsJykuUG9wTGV2ZWw7XG54aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG54aHIub3BlbignR0VUJywgXCJsZXZlbHMvMDEucGx2XCIsIHRydWUpO1xueGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG54aHIub25sb2FkID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIG5ldyBQb3BMZXZlbCh0aGlzLnJlc3BvbnNlKTtcbn07XG54aHIuc2VuZCgpO1xuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgQXNzZXRzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xub3V0JC5Bc3NldHMgPSBBc3NldHMgPSB7fTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgQ2FtZXJhLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xub3V0JC5DYW1lcmEgPSBDYW1lcmEgPSB7fTsiLCJ2YXIgRm9yZVRpbGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLkZvcmVUaWxlID0gRm9yZVRpbGUgPSAoZnVuY3Rpb24oKXtcbiAgRm9yZVRpbGUuZGlzcGxheU5hbWUgPSAnRm9yZVRpbGUnO1xuICB2YXIgZm9yZXRhYmxlVGlsZVR5cGVzLCBwcm90b3R5cGUgPSBGb3JlVGlsZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRm9yZVRpbGU7XG4gIGZvcmV0YWJsZVRpbGVUeXBlcyA9IFtcbiAgICB7XG4gICAgICBjb2RlOiAweDAwLFxuICAgICAgZ3JvdXA6ICdmcmVlJyxcbiAgICAgIG5hbWU6IFwiRW1wdHlcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDEsXG4gICAgICBncm91cDogJ2ZyZWUnLFxuICAgICAgbmFtZTogXCJGbG9vclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwMixcbiAgICAgIGdyb3VwOiAnc3Bpa2UnLFxuICAgICAgbmFtZTogXCJTcGlrZXNcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDMsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJQaWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MDQsXG4gICAgICBncm91cDogJ2dhdGUnLFxuICAgICAgbmFtZTogXCJHYXRlXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA1LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU3R1Y2sgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA2LFxuICAgICAgZ3JvdXA6ICdldmVudCcsXG4gICAgICBuYW1lOiBcIkRyb3AgQnV0dG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA3LFxuICAgICAgZ3JvdXA6ICd0YXBlc3QnLFxuICAgICAgbmFtZTogXCJUYXBlc3RyeVwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwOCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkJvdHRvbSBCaWctcGlsbGFyXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDA5LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiVG9wIEJpZy1waWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MEEsXG4gICAgICBncm91cDogJ3BvdGlvbicsXG4gICAgICBuYW1lOiBcIlBvdGlvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgwQixcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkxvb3NlIEJvYXJkXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBDLFxuICAgICAgZ3JvdXA6ICd0dG9wJyxcbiAgICAgIG5hbWU6IFwiVGFwZXN0cnkgVG9wXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBELFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTWlycm9yXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBFLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiRGVicmlzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDBGLFxuICAgICAgZ3JvdXA6ICdldmVudCcsXG4gICAgICBuYW1lOiBcIlJhaXNlIEJ1dHRvblwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMCxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkV4aXQgTGVmdFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIkV4aXQgUmlnaHRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTIsXG4gICAgICBncm91cDogJ2Nob21wJyxcbiAgICAgIG5hbWU6IFwiQ2hvcHBlclwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxMyxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcmNoXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE0LFxuICAgICAgZ3JvdXA6ICd3YWxsJyxcbiAgICAgIG5hbWU6IFwiV2FsbFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxNSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlNrZWxldG9uXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE2LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiU3dvcmRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTcsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCYWxjb255IExlZnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MTgsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJCYWxjb255IFJpZ2h0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDE5LFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBQaWxsYXJcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUEsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJMYXR0aWNlIFN1cHBvcnRcIlxuICAgIH0sIHtcbiAgICAgIGNvZGU6IDB4MUIsXG4gICAgICBncm91cDogJ25vbmUnLFxuICAgICAgbmFtZTogXCJTbWFsbCBMYXR0aWNlXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFDLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBMZWZ0XCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFELFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTGF0dGljZSBSaWdodFwiXG4gICAgfSwge1xuICAgICAgY29kZTogMHgxRSxcbiAgICAgIGdyb3VwOiAnbm9uZScsXG4gICAgICBuYW1lOiBcIlRvcmNoIHdpdGggRGVicmlzXCJcbiAgICB9LCB7XG4gICAgICBjb2RlOiAweDFGLFxuICAgICAgZ3JvdXA6ICdub25lJyxcbiAgICAgIG5hbWU6IFwiTnVsbFwiXG4gICAgfVxuICBdO1xuICBmdW5jdGlvbiBGb3JlVGlsZShieXRlLCB4LCB5KXtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLmJ5dGUgPSBieXRlO1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICBkYXRhID0gZm9yZXRhYmxlVGlsZVR5cGVzW3RoaXMuYnl0ZSAmIDB4MUZdO1xuICAgIGltcG9ydCQodGhpcywgZGF0YSk7XG4gICAgdGhpcy5tb2RpZmllZCA9ICh0aGlzLmJ5dGUgJiAweDIwKSA+PiA1O1xuICB9XG4gIHJldHVybiBGb3JlVGlsZTtcbn0oKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBkaXYsIFBvcFJvb20sIFBvcExldmVsLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkaXYgPSByZWYkLmRpdjtcblBvcFJvb20gPSByZXF1aXJlKCcuL3Jvb20nKS5Qb3BSb29tO1xub3V0JC5Qb3BMZXZlbCA9IFBvcExldmVsID0gKGZ1bmN0aW9uKCl7XG4gIFBvcExldmVsLmRpc3BsYXlOYW1lID0gJ1BvcExldmVsJztcbiAgdmFyIFBPUF9ST09NX1NJWkUsIHNwZWMsIHByb3RvdHlwZSA9IFBvcExldmVsLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQb3BMZXZlbDtcbiAgUE9QX1JPT01fU0laRSA9IDMwO1xuICBzcGVjID0ge1xuICAgIGZvcmV0YWJsZToge1xuICAgICAgbGVuZ3RoOiA3MjAsXG4gICAgICBvZmZzZXQ6IDBcbiAgICB9LFxuICAgIGJhY2t0YWJsZToge1xuICAgICAgbGVuZ3RoOiA3MjAsXG4gICAgICBvZmZzZXQ6IDcyMFxuICAgIH0sXG4gICAgZG9vckE6IHtcbiAgICAgIGxlbmd0aDogMjU2LFxuICAgICAgb2Zmc2V0OiAxNDQwXG4gICAgfSxcbiAgICBkb29yQjoge1xuICAgICAgbGVuZ3RoOiAyNTYsXG4gICAgICBvZmZzZXQ6IDE2OTZcbiAgICB9LFxuICAgIGxpbmtzOiB7XG4gICAgICBsZW5ndGg6IDk2LFxuICAgICAgb2Zmc2V0OiAxOTUyXG4gICAgfSxcbiAgICB1bmtub3duMToge1xuICAgICAgbGVuZ3RoOiA2NCxcbiAgICAgIG9mZnNldDogMjA0OFxuICAgIH0sXG4gICAgc3RhcnRQb3NpdGlvbjoge1xuICAgICAgbGVuZ3RoOiAzLFxuICAgICAgb2Zmc2V0OiAyMTEyXG4gICAgfSxcbiAgICB1bmtub3duMjoge1xuICAgICAgbGVuZ3RoOiAzLFxuICAgICAgb2Zmc2V0OiAyMTE1XG4gICAgfSxcbiAgICB1bmtub3duMzoge1xuICAgICAgbGVuZ3RoOiAxLFxuICAgICAgb2Zmc2V0OiAyMTE2XG4gICAgfSxcbiAgICBndWFyZExvY2F0aW9uOiB7XG4gICAgICBsZW5ndGg6IDI0LFxuICAgICAgb2Zmc2V0OiAyMTE5XG4gICAgfSxcbiAgICBndWFyZERpcmVjdGlvbjoge1xuICAgICAgbGVuZ3RoOiAyNCxcbiAgICAgIG9mZnNldDogMjE0M1xuICAgIH0sXG4gICAgdW5rbm93bjRhOiB7XG4gICAgICBsZW5ndGg6IDI0LFxuICAgICAgb2Zmc2V0OiAyMTY3XG4gICAgfSxcbiAgICB1bmtub3duNGI6IHtcbiAgICAgIGxlbmd0aDogMjQsXG4gICAgICBvZmZzZXQ6IDIxOTFcbiAgICB9LFxuICAgIGd1YXJkU2tpbGw6IHtcbiAgICAgIGxlbmd0aDogMjQsXG4gICAgICBvZmZzZXQ6IDIyMTVcbiAgICB9LFxuICAgIHVua25vd240Yzoge1xuICAgICAgbGVuZ3RoOiAyNCxcbiAgICAgIG9mZnNldDogMjIzOVxuICAgIH0sXG4gICAgZ3VhcmRDb2xvdXI6IHtcbiAgICAgIGxlbmd0aDogMjQsXG4gICAgICBvZmZzZXQ6IDIyNjNcbiAgICB9LFxuICAgIHVua25vd240ZDoge1xuICAgICAgbGVuZ3RoOiAxNixcbiAgICAgIG9mZnNldDogMjI4N1xuICAgIH0sXG4gICAgZW5kOiB7XG4gICAgICBsZW5ndGg6IDIsXG4gICAgICBvZmZzZXQ6IDIzMDNcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIFBvcExldmVsKHJhdyl7XG4gICAgbG9nKFwibmV3IFBvcExldmVsXCIpO1xuICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkocmF3KTtcbiAgICB0aGlzLnJvb21zID0gdGhpcy5leHRyYWN0Um9vbVRpbGVzO1xuICB9XG4gIHByb3RvdHlwZS5leHRyYWN0Um9vbVRpbGVzID0gZnVuY3Rpb24oYnVmZmVyKXtcbiAgICB2YXIgcm9vbXMsIGksIHN0YXJ0SW5kZXgsIGVuZEluZGV4O1xuICAgIHJldHVybiByb29tcyA9IChmdW5jdGlvbigpe1xuICAgICAgdmFyIGkkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IDA7IGkkIDw9IDI0OyArK2kkKSB7XG4gICAgICAgIGkgPSBpJDtcbiAgICAgICAgc3RhcnRJbmRleCA9IHNwZWMuZm9yZXRhYmxlLm9mZnNldCArIGkgKiBQT1BfUk9PTV9TSVpFO1xuICAgICAgICBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBQT1BfUk9PTV9TSVpFO1xuICAgICAgICByZXN1bHRzJC5wdXNoKG5ldyBQb3BSb29tKGJ1ZmZlci5zdWJhcnJheShzdGFydEluZGV4LCBlbmRJbmRleCkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9KCkpO1xuICB9O1xuICByZXR1cm4gUG9wTGV2ZWw7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBkaXYsIEZvcmVUaWxlLCBQb3BSb29tLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkaXYgPSByZWYkLmRpdjtcbkZvcmVUaWxlID0gcmVxdWlyZSgnLi9mb3JldGlsZScpLkZvcmVUaWxlO1xub3V0JC5Qb3BSb29tID0gUG9wUm9vbSA9IChmdW5jdGlvbigpe1xuICBQb3BSb29tLmRpc3BsYXlOYW1lID0gJ1BvcFJvb20nO1xuICB2YXIgUE9QX1JPT01fU0laRSwgcHJvdG90eXBlID0gUG9wUm9vbS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUG9wUm9vbTtcbiAgUE9QX1JPT01fU0laRSA9IDMwO1xuICBmdW5jdGlvbiBQb3BSb29tKGZvcmVidWZmZXIsIGJhY2tidWZmZXIpe1xuICAgIHZhciBpJCwgdG8kLCBpLCB4LCB5O1xuICAgIHRoaXMuZm9yZWJ1ZmZlciA9IGZvcmVidWZmZXI7XG4gICAgdGhpcy5iYWNrYnVmZmVyID0gYmFja2J1ZmZlcjtcbiAgICB0aGlzLmZvcmV0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICB0aGlzLmJhY2t0aWxlcyA9IFtbXSwgW10sIFtdXTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gUE9QX1JPT01fU0laRTsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHggPSBpICUgMTA7XG4gICAgICB5ID0gZGl2KGksIDEwKTtcbiAgICAgIHRoaXMuZm9yZXRpbGVzW3ldW3hdID0gbmV3IEZvcmVUaWxlKHRoaXMuZm9yZWJ1ZmZlcltpXSk7XG4gICAgICB0aGlzLmJhY2t0aWxlc1t5XVt4XSA9IG5ldyBCYWNrVGlsZSh0aGlzLmJhY2tidWZmZXJbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gUG9wUm9vbTtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5sb2coXCJNb2NrIExldmVsIERhdGFcIik7XG5yZWYkID0gb3V0JDtcbnJlZiRbMF0gPSAwO1xucmVmJFsxXSA9IDA7XG5yZWYkWzJdID0gMDtcbnJlZiRbM10gPSAwOyIsInZhciByZWYkLCBpZCwgbG9nLCBSZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbm91dCQuUmVuZGVyZXIgPSBSZW5kZXJlciA9IHt9OyIsInZhciBpZCwgbG9nLCBtaW4sIG1heCwgZmxvb3IsIHJvdW5kLCBzaW4sIGNvcywgdGF1LCBmbGlwLCBkZWxheSwga2V5cywgZGl2LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5pZCA9IGlkID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQ7XG59O1xub3V0JC5sb2cgPSBsb2cgPSBmdW5jdGlvbigpe1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gYXJndW1lbnRzWzBdO1xufTtcbm91dCQubWluID0gbWluID0gTWF0aC5taW47XG5vdXQkLm1heCA9IG1heCA9IE1hdGgubWF4O1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucm91bmQgPSByb3VuZCA9IE1hdGgucm91bmQ7XG5vdXQkLnNpbiA9IHNpbiA9IE1hdGguc2luO1xub3V0JC5jb3MgPSBjb3MgPSBNYXRoLmNvcztcbm91dCQudGF1ID0gdGF1ID0gTWF0aC5QSSAqIDI7XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmtleXMgPSBrZXlzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaywgdiwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChrIGluIGl0KSB7XG4gICAgdiA9IGl0W2tdO1xuICAgIHJlc3VsdHMkLnB1c2goayk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuZGl2ID0gZGl2ID0gY3VycnkkKGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gZmxvb3IoYSAvIGIpO1xufSk7XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iXX0=
