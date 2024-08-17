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
      // alert('Game Over!');
    }
  }

  updatePosition(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.dx = dx;
    this.dy = dy;
  }

  getDirection() {
    return Math.atan2(this.dy, this.dx);
  }

  render(ctx, offsetX, offsetY) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
    this.renderBackground(ctx, offsetX, offsetY);
    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 10, 0, Math.PI * 2, true); // Draw a circle with radius 10 at the center
    ctx.fillStyle = 'blue'; // Set the fill color
    ctx.fill();
    ctx.closePath();
    if (this.weapon) {
      this.renderWeapon(ctx, offsetX, offsetY);
    }
  }

  renderBackground(ctx, offsetX, offsetY) {
    // Example background rendering (a simple grid)
    ctx.fillStyle = 'lightgray';
    for (let x = -offsetX % 50; x < ctx.canvas.width; x += 50) {
      for (let y = -offsetY % 50; y < ctx.canvas.height; y += 50) {
        ctx.fillRect(x, y, 48, 48);
      }
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
      // Remove the enemy
      const index = enemies.indexOf(this);
      enemies.splice(index, 1);
    }
  }

  moveTowardsPlayer(player) {
    const angle = Math.atan2(player.getY() - this.y, player.getX() - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }

  render(ctx, offsetX, offsetY) {
    ctx.beginPath();
    ctx.arc(this.x - offsetX + ctx.canvas.width / 2, this.y - offsetY + ctx.canvas.height / 2, this.radius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'red'; // Set the fill color for enemies
    ctx.fill();
    ctx.closePath();
  }

  renderHealthBar(ctx, offsetX, offsetY) {
    const barWidth = 50;
    const barHeight = 5;
    const x = this.x - offsetX + ctx.canvas.width / 2 - barWidth / 2;
    const y = this.y - offsetY + ctx.canvas.height / 2 - this.radius - 10;

    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, (this.health / 100) * barWidth, barHeight);

    ctx.strokeStyle = 'black';
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

  render(ctx, offsetX, offsetY, angle) {
    this.draw(ctx, offsetX, offsetY, angle);
  }
}

class Axe extends Weapon {

  draw(ctx, offsetX, offsetY, angle) {
    let x, y;

    if (this.equipped) {
      x = ctx.canvas.width / 2;
      y = ctx.canvas.height / 2;
      this.x = x;
      this.y = y;
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
    ctx.fillStyle = 'brown'; // Set the fill color
    ctx.fill();
    ctx.closePath();

    // Draw the silver blade
    ctx.beginPath();
    ctx.moveTo(x - 2.5, y - 20);
    ctx.lineTo(x - 10, y - 30);
    ctx.lineTo(x + 10, y - 30);
    ctx.lineTo(x + 2.5, y - 20);
    ctx.fillStyle = 'silver'; // Set the fill color
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

    if (this.equipped) {
      x = ctx.canvas.width / 2;
      y = ctx.canvas.height / 2;
      this.x = x;
      this.y = y;
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
    ctx.fillStyle = 'black'; // Set the fill color
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
const player = new Player(0, 0);

const frameRateMonitor = new FrameRateMonitor();

const weapons = [
  new Axe(100, 100),
  new Pistol(200, 100),
];

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

  document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-menu').style.display = 'none';
    startGame();
  });

  document.getElementById('resume-button').addEventListener('click', () => {
    togglePause();
  });

  document.getElementById('restart-button').addEventListener('click', () => {
    restartGame();
  });
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
  weapons.push(new Axe(100, 100), new Pistol(200, 100));
  paused = false;
  document.getElementById('pause-menu').style.display = 'none';
  // startGame();
}

function gameLoop() {
  let dx = 0, dy = 0;
  if (keys['w']) dy = -5; // Move up
  if (keys['a']) dx = -5; // Move left
  if (keys['s']) dy = 5; // Move down
  if (keys['d']) dx = 5; // Move right

  if (!paused) {
    player.updatePosition(dx, dy);
  }

  player.render(ctx, player.getX(), player.getY());
  player.renderHealthBar(ctx);

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
  if (Math.random() < 0.01 && !paused && enemies.length < 1) { // Adjust the probability as needed
    enemies.push(Enemy.spawnRandom(player));
  }

  frameRateMonitor.update();
  frameRateMonitor.render(ctx);

  requestAnimationFrame(gameLoop); // Call gameLoop again on the next frame
}

function startGame() {
  gameLoop();
}

function main() {
  createListeners();

}

main();