/**
 * Cycle Rush: Kolkata Alleyways
 * Game Constants and Configuration
 */

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  GARAGE: 'GARAGE',
  HOW_TO_PLAY: 'HOW_TO_PLAY'
};

export const PHYSICS = {
  // Movement & Speed
  BASE_ACCELERATION: 11.0,
  SPRINT_ACCELERATION: 18.0,
  MAX_NORMAL_SPEED: 21.0,
  MAX_SPRINT_SPEED: 28.0,
  BOOST_SPEED: 35.0,
  FRICTION: 5.2,
  BRAKE_FORCE: 28.0,
  REVERSE_MAX_SPEED: 4.0,
  REVERSE_ACCELERATION: 6.0,
  
  // Steering & Turning (Manual direct control - zero autopilot)
  STEER_SPEED: 8.0,           // Responsive steering buildup
  STEER_RETURN_SPEED: 10.0,   // Quick centering return
  MAX_STEER_ANGLE: 0.22,      // rad (~12.6 deg: agile manual turning arc)
  MAX_LEAN_ANGLE: 0.08,       // rad (~4.5 deg: subtle chassis roll)
  LEAN_SPEED: 6.0,            // Smooth roll transition
  ROAD_WIDTH_LIMIT: 6.8,      // Dynamic track width limit

  // Wobble & Procedural Sway (calm & stable)
  WOBBLE_BASE_FREQ: 3.5,
  WOBBLE_BASE_AMP: 0.005,
  WOBBLE_SPEED_FACTOR: 0.001,
  WOBBLE_LOW_STAMINA_FACTOR: 1.5,
  
  // Stamina
  MAX_STAMINA: 100.0,
  STAMINA_NORMAL_DRAIN: 4.0,      // per sec when pedaling normally
  STAMINA_SPRINT_DRAIN: 22.0,     // per sec when sprint pedaling
  STAMINA_RECOVERY_RATE: 16.0,    // per sec when coasting/braking
  LOW_STAMINA_THRESHOLD: 25.0,
  EXHAUSTED_ACCEL_PENALTY: 0.5,

  // Boost (N2O Energy surge)
  MAX_BOOST_ENERGY: 100.0,
  BOOST_DRAIN_RATE: 28.0,         // ~3.5 seconds boost duration
  BOOST_GAIN_CHAI: 35.0,
  BOOST_GAIN_COCONUT: 55.0,
  BOOST_ACCEL_MULTIPLIER: 1.8,

  // Bell mechanic
  BELL_COOLDOWN: 1.2,             // seconds between rings
  BELL_EFFECT_RADIUS: 18.0,       // distance ahead affected
  BELL_PEDESTRIAN_SCARE_DIST: 14.0
};

export const CANOPY_SKINS = [
  {
    id: 'kaali-peeli',
    name: 'Mumbai Kaali-Peeli',
    price: 0,
    primaryColor: '#f1c40f',
    secondaryColor: '#1a1a1a',
    canopyColor: '#1a1a1a',
    fringeColor: '#f39c12',
    description: 'Iconic yellow body with jet-black canopy and chrome bumpers.',
    pattern: 'kaali-peeli'
  },
  {
    id: 'classic-red',
    name: 'Kolkata Crimson',
    price: 100,
    primaryColor: '#c02727',
    secondaryColor: '#f1c40f',
    canopyColor: '#962d22',
    fringeColor: '#e67e22',
    description: 'Vibrant racing red body with golden trim.',
    pattern: 'stripes'
  },
  {
    id: 'kolkata-yellow',
    name: 'Bengal Saffron',
    price: 150,
    primaryColor: '#e67e22',
    secondaryColor: '#2c3e50',
    canopyColor: '#d35400',
    fringeColor: '#f1c40f',
    description: 'Fiery tangerine orange with deep charcoal trim.',
    pattern: 'taxi-check'
  },
  {
    id: 'royal-blue',
    name: 'Hooghly Royal Blue',
    price: 250,
    primaryColor: '#1a5276',
    secondaryColor: '#f4d03f',
    canopyColor: '#1b4f72',
    fringeColor: '#ecf0f1',
    description: 'Deep Hooghly river midnight blue adorned with silver filigree.',
    pattern: 'waves'
  },
  {
    id: 'bengali-floral',
    name: 'CNG Green',
    price: 350,
    primaryColor: '#27ae60',
    secondaryColor: '#145a32',
    canopyColor: '#1e8449',
    fringeColor: '#f9e79f',
    description: 'Eco-friendly vibrant green with forest canopy.',
    pattern: 'floral'
  },
  {
    id: 'festival-edition',
    name: 'Festival Purple',
    price: 500,
    primaryColor: '#8e44ad',
    secondaryColor: '#f4d03f',
    canopyColor: '#5b2c6f',
    fringeColor: '#d2b4de',
    description: 'Durga Puja special! Draped in royal purple & festival gold.',
    pattern: 'festival'
  }
];

export const OBSTACLES = {
  COW: {
    type: 'cow',
    name: 'Desi Cow',
    width: 1.4,
    length: 2.2,
    speed: 0.6,
    speedPenalty: 0.55, // reduces current speed by 55%
    wobbleImpulse: 0.25,
    pointsPenalty: 50,
    scareable: false,
    message: 'Arrey Dada! Cow on the road!'
  },
  PEDESTRIAN: {
    type: 'pedestrian',
    name: 'Crossing Pedestrian',
    width: 0.8,
    length: 0.8,
    speed: 1.8,
    speedPenalty: 0.35,
    wobbleImpulse: 0.15,
    pointsPenalty: 25,
    scareable: true,
    message: 'Careful! Ring the bell!'
  },
  HAND_CART: {
    type: 'hand_cart',
    name: 'Hand-Pulled Cart',
    width: 1.6,
    length: 2.5,
    speed: 0.8,
    speedPenalty: 0.50,
    wobbleImpulse: 0.22,
    pointsPenalty: 40,
    scareable: true,
    message: 'Cart ahead! Dodge it!'
  },
  PARKED_SCOOTER: {
    type: 'parked_scooter',
    name: 'Vintage Scooter',
    width: 1.0,
    length: 1.6,
    speed: 0,
    speedPenalty: 0.40,
    wobbleImpulse: 0.18,
    pointsPenalty: 30,
    scareable: false,
    message: 'Parked scooter clip!'
  },
  POTHOLE: {
    type: 'pothole',
    name: 'Road Pothole',
    width: 1.8,
    length: 1.8,
    speed: 0,
    speedPenalty: 0.28,
    wobbleImpulse: 0.35,
    pointsPenalty: 15,
    scareable: false,
    message: 'Pothole bump! Hold tight!'
  },
  BARRICADE: {
    type: 'barricade',
    name: 'Police Barricade',
    width: 2.2,
    length: 0.6,
    speed: 0,
    speedPenalty: 0.65,
    wobbleImpulse: 0.3,
    pointsPenalty: 60,
    scareable: false,
    message: 'Police barricade hit!'
  }
};

export const COLLECTIBLES = {
  COIN: {
    type: 'coin',
    name: 'Brass Coin',
    points: 100,
    coins: 1,
    boost: 0,
    scale: 0.45
  },
  CHAI: {
    type: 'chai',
    name: 'Chilled Masala Chai',
    points: 150,
    coins: 0,
    boost: 35,
    scale: 0.55
  },
  COCONUT: {
    type: 'coconut',
    name: 'Tender Coconut (Daab)',
    points: 250,
    coins: 0,
    boost: 55,
    scale: 0.6
  }
};

export const TRACK = {
  SEGMENT_LENGTH: 50.0,
  TOTAL_ACTIVE_SEGMENTS: 5,
  ROAD_WIDTH: 10.4,
  SIDEWALK_WIDTH: 3.2,
  BUILDING_DEPTH: 8.0,
  DESPAWN_DISTANCE_BEHIND: 40.0,
  SPAWN_DISTANCE_AHEAD: 210.0
};

export const COLORS = {
  SKY_TOP: 0xff7b48,
  SKY_BOTTOM: 0xfcb045,
  FOG: 0xff9966,
  SUNLIGHT: 0xfffae0,
  AMBIENT: 0xffcf99,
  ROAD: 0x2d3436,
  ROAD_MARKINGS: 0xecf0f1,
  TRAM_TRACK: 0x7f8c8d,
  SIDEWALK: 0xbdc3c7,
  SIDEWALK_CURB: 0x7f8c8d,
  BRICK_RED: 0xa83232,
  OCHRE_YELLOW: 0xd89725,
  COLONIAL_TEAL: 0x3d7068,
  HERITAGE_CREAM: 0xe8dfc8,
  DARK_WOOD: 0x4a2e18,
  AMBER_LIGHT: 0xffaa00,
  AMBASSADOR_YELLOW: 0xf1b40e
};

