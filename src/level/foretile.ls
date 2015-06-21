
#
# ForeTile
#
# Structured version of a PLV foretable byte
#

export class ForeTile

  foretable-tile-types =
    * code: 0x00, group: \free,   name: "Empty"
    * code: 0x01, group: \free,   name: "Floor"
    * code: 0x02, group: \spike,  name: "Spikes"
    * code: 0x03, group: \none,   name: "Pillar"
    * code: 0x04, group: \gate,   name: "Gate"
    * code: 0x05, group: \none,   name: "Stuck Button"
    * code: 0x06, group: \event,  name: "Drop Button"
    * code: 0x07, group: \tapest, name: "Tapestry"
    * code: 0x08, group: \none,   name: "Bottom Big-pillar"
    * code: 0x09, group: \none,   name: "Top Big-pillar"
    * code: 0x0A, group: \potion, name: "Potion"
    * code: 0x0B, group: \none,   name: "Loose Board"
    * code: 0x0C, group: \ttop,   name: "Tapestry Top"
    * code: 0x0D, group: \none,   name: "Mirror"
    * code: 0x0E, group: \none,   name: "Debris"
    * code: 0x0F, group: \event,  name: "Raise Button"
    * code: 0x10, group: \none,   name: "Exit Left"
    * code: 0x11, group: \none,   name: "Exit Right"
    * code: 0x12, group: \chomp,  name: "Chopper"
    * code: 0x13, group: \none,   name: "Torch"
    * code: 0x14, group: \wall,   name: "Wall"
    * code: 0x15, group: \none,   name: "Skeleton"
    * code: 0x16, group: \none,   name: "Sword"
    * code: 0x17, group: \none,   name: "Balcony Left"
    * code: 0x18, group: \none,   name: "Balcony Right"
    * code: 0x19, group: \none,   name: "Lattice Pillar"
    * code: 0x1A, group: \none,   name: "Lattice Support"
    * code: 0x1B, group: \none,   name: "Small Lattice"
    * code: 0x1C, group: \none,   name: "Lattice Left"
    * code: 0x1D, group: \none,   name: "Lattice Right"
    * code: 0x1E, group: \none,   name: "Torch with Debris"
    * code: 0x1F, group: \none,   name: "Null"

  (@byte, @x, @y) ->
    data = foretable-tile-types[ @byte .&. 0x1F ]
    this <<< data
    @modified = (@byte .&. 0x20) .>>. 5


