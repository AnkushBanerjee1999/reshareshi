# Cycle Rush: Kolkata Alleyways 🛺 🏁

> **A fast-paced, competitive 3D arcade cycle-rickshaw racing game through the vibrant heritage streets of Kolkata, built using Three.js, vanilla JavaScript (ES6+), HTML5 Canvas, and Web Audio API.**

---

## 🏆 Game Overview: The Kolkata Grand Prix

In **Cycle Rush: Kolkata Alleyways**, you compete in the **1200-meter Kolkata Rickshaw Grand Prix** against **6 fierce AI-controlled rival cycle rickshaws** through the narrow, crowded heritage lanes of old Calcutta.

Position your rickshaw on the starting grid, wait for the **3... 2... 1... GO!** countdown, and sprint down a wide 5-lane course featuring embedded tram tracks, parked Ambassador yellow taxis, roadside chai stalls, and unpredictable street traffic. Overtake competitors, manage your pedaling stamina, collect steaming kulhads of masala chai and fresh green coconuts (*daab*) for nitro speed surges, and cross the finish line in 1st place!

---

## 🏁 Meet the Competitors (7 Racers on the Grid)

| Racer | Canopy Style | Racing Personality & Characteristics |
|---|---|---|
| **Player (You)** | Customizable | Dynamic steering, manual sprint cadence, and boost activation |
| **Bikash "Storm" Das** | Crimson Red Stripes | Aggressive acceleration, high stamina, tries to lead early |
| **Subhash "Hooghly" Roy** | Royal Blue Waves | Balanced driving, steady cruising, smooth lane changing |
| **Gopal "Tollygunge" Sen** | Emerald Floral | Cautious steering, tight racing line, patient overtaker |
| **Anirban "Taxi" Ghosh** | Yellow Taxi Checker | Aggressive overtaker, frequently swerves into open gaps |
| **Debu "Dhakuria" Mukherjee** | Purple Velvet | Unpredictable speed surges and sudden lane switches |
| **Tarun "Howrah" Banerjee** | Marigold Orange Festival | High top speed, formidable late-race surge |

---

## 🎮 Controls

| Key | Action | In-Game Mechanics |
|---|---|---|
| **W** or **↑** | **Pedal Forward** | Builds forward momentum. Double-tap rapidly for acceleration cadence bursts! |
| **Shift** + **Pedal** | **Sprint Pedal** | Hard sprint pedaling to hit top speed and overtake rivals (burns stamina faster). |
| **A** / **D** or **←** / **→** | **Steer & Lane Change** | Weave between 5 lanes to pass opponents and dodge obstacles. |
| **S** or **↓** | **Hand Brake** | Quick braking to avoid pileups, wandering cows, or barricades. |
| **Spacebar** | **Tring-Tring Bell 🔔** | Rings the authentic brass rickshaw bell with expanding soundwaves. Scares crossing pedestrians out of your lane! |
| **E** | **Energy Boost 🔥** | Unleashes an N₂O speed surge when boost meter is charged. |
| **Escape** or **P** | **Pause / Resume** | Freezes the race and opens the pause overlay. |
| **R** | **Quick Restart** | Restarts a fresh race immediately from the starting grid. |

---

## 🌟 Key Racing Mechanics

1. **True Forward Coordinate System**:
   - The player and all AI racers face forward toward the track direction (Negative Z).
   - Scenery, buildings, and tracks stream past realistically from front to back.
   - Front fork and handlebars steer in the true direction of travel.

2. **Full Starting Sequence & Countdown**:
   - Staggered starting grid layout with painted starting line and yellow grid boxes.
   - Large animated starting countdown: **3... 2... 1... GO!** with audio chimes.
   - All racers held stationary until "GO!", then launch simultaneously into the race.

3. **Dynamic AI Racing & Overtaking Logic**:
   - Opponents continuously scan the road ahead for slower racers and obstacles.
   - Switch lanes dynamically to slipstream and overtake competitors.
   - Racer-to-racer proximity physics: mutual lateral nudges on side-by-side contact so vehicles bump realistically without clipping through.

4. **Live Race Leaderboard & Progress HUD**:
   - Real-time position tracking (`1st / 7`, `2nd / 7`, etc.) based on actual distance along the 1200m track.
   - Progress bar and distance remaining indicator (`420m / 1200m`).
   - Digital race timer, speedometer dial, stamina bar, and boost meter.

5. **Grand Finish Line & Results Screen**:
   - Prominent 1200m finish line gantry with checkered asphalt ribbon and celebration banners.
   - Race Results Screen displaying finishing rank, race time, earned brass coins, and high score records.
   - 1st Place Champion trophy & victory fanfare!

---

## 🚀 How to Run Locally

### Option 1: One-Click Windows Launcher (No Installation Required!)
Double-click:
```bat
start-server.bat
```
*(Uses the native zero-dependency PowerShell HTTP server script `start-server.ps1` and opens `http://localhost:8080` in your default browser)*

### Option 2: Using Vite / Node.js
```bash
npx vite
# or
npm run dev
# or
pnpm dev
```

### Option 3: Using Python
```bash
python -m http.server 8000
```

---

## 📁 Project Architecture

```text
cycle-rush-kolkata/
├── index.html                   # HTML entry point with Three.js import map
├── package.json                 # Project configuration & dependencies
├── vite.config.js               # Vite configuration with fallback resolver
├── start-server.bat             # 1-click Windows web server launcher
├── start-server.ps1             # Standalone local HTTP server script
├── README.md                    # Documentation & manual
│
└── src/
    ├── main.js                  # Application bootstrapper
    ├── Game.js                  # Master racing coordinator & state machine
    ├── GameLoop.js              # RAF animation loop & clamped delta time
    │
    ├── controllers/
    │   ├── RickshawFactory.js     # Reusable 3D rickshaw models with rider kinematics
    │   ├── RickshawController.js  # Player vehicle, controls & forward physics
    │   ├── AIRacerController.js   # Autonomous AI competitors & overtaking logic
    │   ├── CameraController.js    # Chase camera with trauma shake & lookahead
    │   └── InputManager.js        # Keyboard tracker & rapid-tap cadence detector
    │
    ├── world/
    │   ├── World.js               # Three.js scene, lighting & atmospheric depth
    │   ├── RaceTrack.js           # 1200m 5-lane course, start gantry & finish line
    │   ├── SplinePath.js          # Road alignment utilities
    │   ├── EnvironmentBuilder.js  # Yellow taxis, chai stalls, streetlights, poles
    │   ├── BuildingGenerator.js   # Heritage Kolkata colonial architecture facades
    │   └── TextureGenerator.js    # Procedural canvas textures for rickshaw art
    │
    ├── systems/
    │   ├── RaceManager.js         # Countdown, grid positions, live ranks, finish line
    │   ├── RacingCollisionSystem.js # Racer-to-racer bumping, obstacle collisions
    │   ├── ObstacleManager.js     # Desi cows, pedestrians, hand-carts, potholes
    │   ├── CollectibleManager.js  # Chai cups, green coconuts, brass coins
    │   ├── AudioManager.js        # Web Audio API procedural synthesis
    │   └── SaveManager.js         # LocalStorage progression persistence
    │
    ├── ui/
    │   ├── UIManager.js           # Screen routing & state coordinator
    │   ├── HUD.js                 # Position badge (1st/7), progress %, countdown, speed
    │   ├── MainMenu.js            # Title screen & lifetime records
    │   ├── Garage.js              # 3D canopy preview & unlock shop
    │   └── GameOverScreen.js      # Race results, placement trophy, race time
    │
    └── utils/
        ├── Constants.js           # Physics tuning, canopy skins, obstacles
        ├── MathUtils.js           # Damping, lerp, collision geometry math
        └── ObjectPool.js          # Memory-efficient object pooling
```

---

## 🛞 License
MIT License. Crafted for Indian retro arcade game lovers!
