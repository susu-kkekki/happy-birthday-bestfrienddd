# Leago Birthday Arena

A browser-based mini fighting game built as a birthday surprise. The project includes a stage, health UI, movement and attack controls, and a final reveal screen.

## Files

- `index.html` — game layout and HUD structure
- `style.css` — visual styling for the battlefield, HUD, controls, and reveal screen
- `script.js` — game logic for movement, attack resolution, phases, health, and endgame flow

## How to use

1. Open `index.html` in a browser.
2. Rotate your device or view in landscape for the best experience.
3. Use the on-screen controls:
   - Left / right buttons to move
   - `PUNCH (A)` to attack
   - `KICK (B)` to attack

## Gameplay

- The game has multiple phases with different opponents.
- Each attack checks distance and resolves hits or misses.
- Score is tracked as `00 / 22 HIT`.
- Health updates for player and enemy.
- When the final phase is cleared, a birthday reveal screen appears.

## Notes

- The game is a static web app; no build tools are required.
- Just open `index.html` locally in a browser.

## Credits

Created as a custom birthday project with pixel-style character sprites and animated battle visuals.
