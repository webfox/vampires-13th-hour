/**
 * GAME CLASSES
 */

class FrameRateMonitor {
  constructor() {
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.fps = 0;
  }

  update() {
    const currentTime = performance.now();
    this.frameCount++;
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  render(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${this.fps}`, 10, 20);
  }
}

class Random {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.weapon = null; // The player starts without a weapon
    this.attacking = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.dx = 0;
    this.dy = 0;
    this.health = 100;
    this.viewDistance = 100;
    this.score = 0;
    this.walkingSpeed = 2;
    this.frames = [
      'assets/big_chin/big_chin_0.webp',
      'assets/big_chin/big_chin_1.webp',
    ];
    this.currentFrame = 0;
    this.frameInterval = 500; // Time in ms between frames
    this.lastFrameTime = performance.now();
    this.images = [];
    this.preloadImages();
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 24;
    this.offscreenCanvas.height = 30;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getHealth() {
    return this.health;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setHealth(health) {
    this.health = health;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      endGame();
    }
  }

  preloadImages() {
    for (const src of this.frames) {
      const img = new Image();
      img.src = src;
      this.images.push(img);
    }
  }

  updatePosition(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.dx = dx;
    this.dy = dy;
  }

  updateFrame() {
    const currentTime = performance.now();
    if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.lastFrameTime = currentTime;
    }
  }

  updateScore(score) {
    this.score += score;
  }

  getDirection() {
    return Math.atan2(this.dy, this.dx);
  }

  render(ctx, offsetX, offsetY) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    // Draw radial gradient around the player
    const gradient = ctx.createRadialGradient(
      ctx.canvas.width / 2, ctx.canvas.height / 2, 0,
      ctx.canvas.width / 2, ctx.canvas.height / 2, this.viewDistance * 2,
    );
    gradient.addColorStop(0, 'rgb(140,140,140,0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.renderTexturedBackground(ctx, offsetX, offsetY);

    this.updateFrame();
    this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    this.offscreenCtx.drawImage(this.images[this.currentFrame], 0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    ctx.drawImage(this.offscreenCanvas, ctx.canvas.width / 2 - this.offscreenCanvas.width / 2, ctx.canvas.height / 2 - this.offscreenCanvas.height / 2, this.offscreenCanvas.width, this.offscreenCanvas.height);

    if (this.weapon) {
      this.renderWeapon(ctx, offsetX, offsetY);
    }

  }

  renderHealthBar(ctx) {
    const barWidth = 400;
    const barHeight = 10;
    const x = ctx.canvas.width / 2 - barWidth / 2;
    const y = ctx.canvas.height / 2 - 380;

    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, (this.health / 100) * barWidth, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
  }

  renderScore(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${this.score}`, 10, 40);
  }

  renderTexturedBackground(ctx, offsetX, offsetY) {
    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    patternCanvas.width = 800;
    patternCanvas.height = 800;

    const numberOfPoints = 2000;
    const mapSizeMultiplier = 20;

    const seed = 12345; // Fixed seed for consistent random values
    const random = new Random(seed);

    for (let i = 0; i < numberOfPoints * mapSizeMultiplier; i++) {
      const randomX = random.next() * ctx.canvas.width * mapSizeMultiplier;
      const randomY = random.next() * ctx.canvas.height * mapSizeMultiplier;
      patternContext.fillStyle = 'rgba(21,17,9,0.5)';
      patternContext.beginPath();
      patternContext.arc(randomX - offsetX - (100 * mapSizeMultiplier), randomY - offsetY - (100 * mapSizeMultiplier), 2, 0, Math.PI * 2, true);
      patternContext.fill();
    }


    const pattern = ctx.createPattern(patternCanvas, 'repeat');

    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(-100 * mapSizeMultiplier, -100 * mapSizeMultiplier, (patternCanvas.width + 100) * mapSizeMultiplier, (patternCanvas.height + 100) * mapSizeMultiplier);
    ctx.restore();
  }

  checkCollision(weapon) {
    const playerCenterX = this.x;
    const playerCenterY = this.y;
    const weaponCenterX = weapon.getX();
    const weaponCenterY = weapon.getY();
    const distance = Math.sqrt((playerCenterX - weaponCenterX) ** 2 + (playerCenterY - weaponCenterY) ** 2);
    return distance < 15; // Assuming a collision radius of 15
  }

  pickUpWeapon(weapon) {
    if (this.weapon) {
      this.weapon.setEquipped(false);
      this.weapon.setX(this.x);
      this.weapon.setY(this.y);
    }


    weapon.setEquipped(true);
    this.weapon = weapon;
  }

  renderWeapon(ctx, offsetX, offsetY) {
    if (this.weapon) {
      this.weapon.render(ctx, offsetX, offsetY, this.getMouseAngle());
    }
  }

  getMouseAngle() {
    const playerCenterX = ctx.canvas.width / 2;
    const playerCenterY = ctx.canvas.height / 2;
    return Math.atan2(this.mouseY - playerCenterY, this.mouseX - playerCenterX);
  }

  updateMousePosition(x, y) {
    this.mouseX = x;
    this.mouseY = y;
  }

  attack() {
    if (this.weapon) {
      this.attacking = true;
      this.weapon.attack(this.x, this.y, this.getMouseAngle());
      setTimeout(() => {
        this.attacking = false;
      }, 500);
    }
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.speed = 1;
    this.health = 100;
    this.lastAttackTime = 0;
    this.attackCooldown = 1000;
    this.attackDamage = 5;
    this.points = 10;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getHealth() {
    return this.health;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setHealth(health) {
    this.health = health;
  }

  updateHealth(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      const index = enemies.indexOf(this);
      player.updateScore(this.points);
      enemies.splice(index, 1);

    }
  }

  moveTowardsPlayer(player) {
    const angle = Math.atan2(player.getY() - this.y, player.getX() - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }

  render(ctx, offsetX, offsetY) {
    const distance = Math.sqrt((this.x - player.getX()) ** 2 + (this.y - player.getY()) ** 2);
    const opacity = Math.max(0, Math.min(1, 1 - (distance - player.viewDistance) / 100));
    ctx.beginPath();
    ctx.arc(this.x - offsetX + ctx.canvas.width / 2, this.y - offsetY + ctx.canvas.height / 2, this.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = `rgb(255, 0, 0,${opacity})`;
    ctx.fill();
    ctx.closePath();
  }

  renderHealthBar(ctx, offsetX, offsetY) {
    const distance = Math.sqrt((this.x - player.getX()) ** 2 + (this.y - player.getY()) ** 2);
    const opacity = Math.max(0, Math.min(1, 1 - (distance - player.viewDistance) / 100));
    const barWidth = 50;
    const barHeight = 5;
    const x = this.x - offsetX + ctx.canvas.width / 2 - barWidth / 2;
    const y = this.y - offsetY + ctx.canvas.height / 2 - this.radius - 10;

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
    ctx.fillRect(x, y, (this.health / 100) * barWidth, barHeight);

    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.strokeRect(x, y, barWidth, barHeight);
  }

  checkCollision(player) {
    const distance = Math.sqrt((this.x - player.getX()) ** 2 + (this.y - player.getY()) ** 2);
    const currentTime = performance.now();
    if (distance < this.radius + 10 && currentTime - this.lastAttackTime > this.attackCooldown) { // Assuming player's radius is 10
      this.lastAttackTime = currentTime;
      return true;
    }
    return false;
  }

  static spawnRandom(player) {
    const direction = player.getDirection();
    const distance = 400; // Distance off the map
    const x = player.getX() + Math.cos(direction) * distance;
    const y = player.getY() + Math.sin(direction) * distance;
    return new Enemy(x, y);
  }
}

class Weapon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.equipped = false;
    this.attacking = false;
    this.damage = 10;
    this.range = 20;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setEquipped(equipped) {
    this.equipped = equipped;
  }

  draw(ctx, offsetX, offsetY, angle) {}

  checkCollision(enemy, offsetX, offsetY) {}

  attack() {}

  static spawnRandom() {
    const direction = player.getDirection();
    const distance = 400; // Distance off the map
    const x = player.getX() + Math.cos(direction) * distance;
    const y = player.getY() + Math.sin(direction) * distance;
    return new this(x, y);
  }

  render(ctx, offsetX, offsetY, angle) {
    this.draw(ctx, offsetX, offsetY, angle);
  }
}

class Axe extends Weapon {

  draw(ctx, offsetX, offsetY, angle) {
    let x, y;
    const distance = Math.sqrt((this.x - player.getX()) ** 2 + (this.y - player.getY()) ** 2);
    let opacity = Math.max(0, Math.min(1, 1 - (distance - player.viewDistance) / 100));

    if (this.equipped) {
      x = ctx.canvas.width / 2;
      y = ctx.canvas.height / 2;
      this.x = x;
      this.y = y;
      opacity = 1;
    } else {
      x = this.x - offsetX + ctx.canvas.width / 2;
      y = this.y - offsetY + ctx.canvas.height / 2;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.angle + angle);
    ctx.translate(-x, -y);

    // Draw the brown handle
    ctx.beginPath();
    ctx.rect(x - 2.5, y - 20, 5, 40); // Draw a rectangle representing the stick
    ctx.fillStyle = `rgb(0,120,120,${opacity})`; // Set the fill color
    ctx.fill();
    ctx.closePath();

    // Draw the silver blade
    ctx.beginPath();
    ctx.moveTo(x - 2.5, y - 20);
    ctx.lineTo(x - 10, y - 30);
    ctx.lineTo(x + 10, y - 30);
    ctx.lineTo(x + 2.5, y - 20);
    ctx.fillStyle = `rgb(120,120,120,${opacity})`; // Set the fill color
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }


  attack() {
    this.angle = 0; // Start angle
    const swingDuration = 500; // Duration of the swing in milliseconds
    const startTime = performance.now();
    this.attacking = true;

    const animateSwing = (currentTime) => {

      if (!this.attacking) {
        this.angle = 0;
        return;
      }

      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / swingDuration, 1);
      this.angle = this.angle + (Math.PI / 15) * progress; // Animate from -45 to +45 degrees

      if (progress < 1) {
        requestAnimationFrame(animateSwing);
      } else {
        this.angle = 0; // Reset angle after swing
        this.attacking = false;
      }
    };

    requestAnimationFrame(animateSwing);
  }

  checkCollision(enemy, offsetX, offsetY) {
    const weaponCenterX = this.x;
    const weaponCenterY = this.y;
    const enemyCenterX = enemy.getX() - offsetX + ctx.canvas.width / 2;
    const enemyCenterY = enemy.getY() - offsetY + ctx.canvas.height / 2;
    const distance = Math.sqrt((weaponCenterX - enemyCenterX) ** 2 + (weaponCenterY - enemyCenterY) ** 2);
    const collision = distance < this.range + enemy.radius;
    if (collision) {
      this.attacking = false;
    }
    return collision;
  }

}

class Bullet {
  constructor(x, y, angle, speed, radius, damage) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.radius = radius;
    this.damage = damage;
  }

  movePosition() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  checkCollision(enemy) {
    const distance = Math.sqrt((this.x - enemy.getX()) ** 2 + (this.y - enemy.getY()) ** 2);
    return distance < this.radius + enemy.radius;
  }

  draw(ctx, offsetX, offsetY) {
    ctx.beginPath();
    ctx.arc(this.x - offsetX + ctx.canvas.width / 2, this.y - offsetY + ctx.canvas.height / 2, this.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'black'; // Set the fill color
    ctx.fill();
    ctx.closePath();
  }

}

class Gun extends Weapon {
  constructor(x, y) {
    super(x, y);
    this.bullets = [];
  }
}

class Pistol extends Gun {
  attack(x, y, angle) {
    const bullet = new Bullet(x, y, angle, 5, 2, 10);
    this.bullets.push(bullet);
  }

  checkCollision(enemy, offsetX, offsetY) {
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].checkCollision(enemy)) {
        this.bullets.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  draw(ctx, offsetX, offsetY, angle) {
    let x, y;
    const distance = Math.sqrt((this.x - player.getX()) ** 2 + (this.y - player.getY()) ** 2);
    let opacity = Math.max(0, Math.min(1, 1 - (distance - player.viewDistance) / 100));

    if (this.equipped) {
      x = ctx.canvas.width / 2;
      y = ctx.canvas.height / 2;
      this.x = x;
      this.y = y;
      opacity = 1;
    } else {
      x = this.x - offsetX + ctx.canvas.width / 2;
      y = this.y - offsetY + ctx.canvas.height / 2;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.angle + angle);
    ctx.translate(-x, -y);

    ctx.beginPath();
    ctx.rect(x - 5, y - 10, 10, 20); // Draw a rectangle representing the gun
    ctx.fillStyle = `rgb(0,0,0,${opacity})`; // Set the fill color
    ctx.fill();
    ctx.closePath();

    ctx.restore();
    for (let i = 0; i < this.bullets.length; i++) {
      this.bullets[i].movePosition();
      this.bullets[i].draw(ctx, offsetX, offsetY);
    }

  }
}

/**
 * GAME CONSTANTS
 */
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const keys = {};
let paused = false;
let remainingTime = 13 * 60;

const player = new Player(0, 0);

const frameRateMonitor = new FrameRateMonitor();

const availableWeapons = [Axe, Pistol];

const weapons = [];

const enemies = [];

/**
 * MAIN GAME FUNCTIONS
 */
function createListeners() {
  function handleKeyDown(event) {
    keys[event.key] = true;
    if (event.key === 'p' || event.key === 'Escape') {
      togglePause();
    }
  }

  function handleKeyUp(event) {
    keys[event.key] = false;
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);


  document.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    player.updateMousePosition(event.clientX - rect.left, event.clientY - rect.top);
  });
  document.addEventListener('mousedown', () => {
    player.attack();
  });

  // document.getElementById('start-button').addEventListener('click', () => {
  //   document.getElementById('start-menu').style.display = 'none';
  //   startGame();
  // });
  //
  // document.getElementById('resume-button').addEventListener('click', () => {
  //   togglePause();
  // });
  //
  // document.getElementById('restart-button').addEventListener('click', () => {
  //   restartGame();
  // });
  //
  // document.getElementById('restart-button-2').addEventListener('click', () => {
  //   restartGame();
  // });
}

function togglePause() {
  paused = !paused;
  document.getElementById('pause-menu').style.display = paused ? 'flex' : 'none';
}

function restartGame() {
  player.setX(0);
  player.setY(0);
  player.setHealth(100);
  player.weapon = null;
  player.attacking = false;
  enemies.length = 0;
  weapons.length = 0;
  paused = false;
  document.getElementById('end-menu').style.display = 'none';
  document.getElementById('pause-menu').style.display = 'none';
  remainingTime = 13 * 60;
}

function gameLoop() {
  let dx = 0, dy = 0;
  if (keys['w']) dy = -player.walkingSpeed;
  if (keys['a']) dx = -player.walkingSpeed;
  if (keys['s']) dy = player.walkingSpeed;
  if (keys['d']) dx = player.walkingSpeed;

  if (!paused) {
    player.updatePosition(dx, dy);
  }

  player.render(ctx, player.getX(), player.getY());
  player.renderHealthBar(ctx);
  player.renderScore(ctx);

  for (const weapon of weapons) {
    if (player.checkCollision(weapon)) {
      if (keys['e']) {
        player.pickUpWeapon(weapon);
      }
    }
    weapon.render(ctx, player.getX(), player.getY(), player.getMouseAngle());
  }

  for (const enemy of enemies) {
    if (!paused) {
      enemy.moveTowardsPlayer(player);
    }
    enemy.render(ctx, player.getX(), player.getY());
    enemy.renderHealthBar(ctx, player.getX(), player.getY());
    if (player.attacking && !!player.weapon && player.weapon.checkCollision(enemy, player.getX(), player.getY())) {
      enemy.updateHealth(player.weapon.damage);
    }
    if (enemy.checkCollision(player) && !paused) {
      player.takeDamage(enemy.attackDamage);
    }
  }

  // Randomly spawn enemies
  if (Math.random() < 0.01 && !paused && enemies.length < 0) {
    enemies.push(Enemy.spawnRandom(player));
  }

  if (Math.random() < 0.01 && !paused && weapons.length < 5) {
    weapons.push(availableWeapons[Math.floor(Math.random() * availableWeapons.length)].spawnRandom());
  }

  frameRateMonitor.update();
  frameRateMonitor.render(ctx);

  requestAnimationFrame(gameLoop);
}


function updateClock() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  document.getElementById('clock').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function countdown() {
  if (remainingTime > 0) {
    remainingTime--;
    updateClock();
  } else {
    endGame();
  }
}

function endGame() {
  paused = true;
  document.getElementById('end-menu').style.display = 'flex';
}

function startGame() {
  setInterval(countdown, 1000);
  gameLoop();
}

function main() {
  createListeners();
  startGame();
}

main();
