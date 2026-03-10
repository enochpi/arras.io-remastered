const CONFIG = {
    MAP_WIDTH: 7000,
    MAP_HEIGHT: 7000,
    GRID_SIZE: 48,
    GRID_COLOR: "rgba(0,0,0,0.055)",
    BG_COLOR: "#cdcbbe",
    BORDER_WIDTH: 50,
    BORDER_GLOW: "rgba(200,60,60,0.13)",

    TANK_RADIUS: 30,
    TANK_SPEED: 4.5,
    TANK_BODY: "#00b0db",
    TANK_BODY_HI: "#3dd8ff",
    TANK_BODY_LO: "#0088aa",
    TANK_BARREL: "#888",
    TANK_BARREL_HI: "#aaa",
    TANK_BARREL_LO: "#666",
    TANK_OUTLINE: "#555",
    TANK_FRICTION: 0.91,
    TANK_ACCEL: 0.7,
    TANK_HP: 100,
    TANK_REGEN: 0.025,

    BULLET_SPEED: 11,
    BULLET_RADIUS: 8,
    BULLET_DMG: 12,
    BULLET_LIFE: 80,
    BULLET_COLOR: "#00b0db",
    BULLET_GLOW: "rgba(0,176,219,0.35)",
    BULLET_TRAIL_LEN: 6,
    FIRE_RATE: 6,
    FIRE_SHAKE: 1.8,
    MUZZLE_FLASH: 5,

    MAX_SHAPES: 180,
    SHAPE_SPAWN_RATE: 6,
    SHAPE_DRIFT: 0.25,
    SHAPE_SPAWN_FRAMES: 25,
    SHAPE_DEATH_PARTS: 12,
    SHAPE_KNOCKBACK: 2.5,

    SHAPES: {
        square:   { sides:4, size:17, color:"#ffe869", dark:"#e6c800", outline:"#c9a800", hp:12,  scoreMin:5,    scoreMax:10,    weight:48 },
        triangle: { sides:3, size:24, color:"#fc7a5a", dark:"#d04520", outline:"#b83d15", hp:35,  scoreMin:100,  scoreMax:200,   weight:30 },
        pentagon: { sides:5, size:34, color:"#768dfc", dark:"#4a5cc9", outline:"#3a4ab0", hp:120, scoreMin:1000, scoreMax:1500,  weight:16 },
        hexagon:  { sides:6, size:48, color:"#00e8ca", dark:"#00a88e", outline:"#008874", hp:350, scoreMin:3000, scoreMax:10000, weight:6  }
    },

    RARES: {
        shiny:     { color:"#44ff88", dark:"#22bb55", glow:"rgba(68,255,136,0.55)",  glowR:25, rarity:100,  multMin:50,   multMax:150,  bonusMin:0,   bonusMax:0,   scale:1.18, label:"SHINY",     pColor:"#66ffaa" },
        legendary: { color:"#4499ff", dark:"#2266cc", glow:"rgba(68,153,255,0.55)",  glowR:30, rarity:500,  multMin:1,    multMax:1,    bonusMin:400, bonusMax:750, scale:1.22, label:"LEGENDARY", pColor:"#66bbff" },
        shadow:    { color:"#22223a", dark:"#111126", glow:"rgba(10,10,30,0.45)",    glowR:20, rarity:1000, multMin:800,  multMax:2000, bonusMin:0,   bonusMax:0,   scale:1.2,  label:"SHADOW",    pColor:"#333355" },
        rainbow:   { color:"#ff0000", dark:"#cc0000", glow:"rgba(255,255,255,0.45)", glowR:35, rarity:5000, multMin:4000, multMax:10000,bonusMin:0,   bonusMax:0,   scale:1.38, label:"RAINBOW",   pColor:"#ffffff" }
    },

    WALL_COUNT: 55,
    WALL_MIN: 80,
    WALL_MAX: 340,
    WALL_THICK: 32,
    WALL_FILL: "#a8a398",
    WALL_HI: "#b8b3a8",
    WALL_LO: "#908880",
    WALL_STROKE: "#7a756c",

    P_POOL: 600,
    P_SPEED: 3.5,
    P_LIFE: 28,
    P_SIZE: 4.5,

    SPARK_N: 5,
    SPARK_SPEED: 6,
    SPARK_LIFE: 15,
    SPARK_SIZE: 3,

    TRAIL_POOL: 400,
    TRAIL_LIFE: 12,

    CAM_LERP: 0.075,
    CAM_SHAKE_DECAY: 0.88,

    MM_SIZE: 190,
    MM_MARGIN: 14,
    MM_BG: "rgba(30,30,40,0.72)",
    MM_BORDER: "rgba(255,255,255,0.18)",
    MM_RADAR_SPEED: 0.018,
    MM_RADAR_COLOR: "rgba(0,200,180,0.25)",

    POP_LIFE: 55,
    POP_RISE: 1.6,
    POP_FONT: 17,

    SHAKE_S: 2,
    SHAKE_M: 4,
    SHAKE_L: 7,
    SHAKE_XL: 12,

    REGIONS: [
        { x:0,    y:0,    w:3500, h:3500, tint:"rgba(200,180,140,0.04)" },
        { x:3500, y:0,    w:3500, h:3500, tint:"rgba(140,180,200,0.04)" },
        { x:0,    y:3500, w:3500, h:3500, tint:"rgba(180,200,140,0.04)" },
        { x:3500, y:3500, w:3500, h:3500, tint:"rgba(200,140,180,0.04)" }
    ]
};
