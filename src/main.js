/**
 * GAME CLASSES
 */
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
      alert('Game Over!');
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

      this.weapon.startSwing();
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
    this.radius = 10; // Radius for collision detection
    this.speed = 1; // Speed of the
    this.health = 100;
    this.lastAttackTime = 0; // Track the last attack time
    this.attackCooldown = 1000; // Cooldown period in milliseconds
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
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.equipped = false;
    this.attacking = false;
    this.damage = 10;
    this.range = 20;
    this.dx = 0;
    this.dy = 0;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getType() {
    return this.type;
  }

  setX(x) {
    this.x = x;
  }

  setY(y) {
    this.y = y;
  }

  setType(type) {
    this.type = type;
  }

  updatePosition(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  setEquipped(equipped) {
    this.equipped = equipped;
  }

  drawAxe(ctx, offsetX, offsetY, angle) {
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

    return  collision;
  }
  startSwing() {
    this.angle = 0; // Start angle
    const swingDuration = 500; // Duration of the swing in milliseconds
    const startTime = performance.now();
    this.attacking = true;

    const animateSwing = (currentTime) => {

      if(!this.attacking) {
        this.angle = 0;
        return
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


  render(ctx, offsetX, offsetY, angle) {
    if (this.type === 'axe') {
      this.drawAxe(ctx, offsetX, offsetY, angle);
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
let lastPauseTime = 0;
const pauseCooldown = 500;

const player = new Player(0, 0);

const weapons = [
  new Weapon(100, 100, 'axe'),
  new Weapon(300, 300, 'axe'),
  new Weapon(400, 400, 'axe'),
];

const enemies = [];


/**
 * MAIN GAME FUNCTIONS
 */
function createListeners() {
  function handleKeyDown(event) {
    keys[event.key] = true;
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

}

function gameLoop() {
  let dx = 0, dy = 0;
  if (keys['w']) dy = -5; // Move up
  if (keys['a']) dx = -5; // Move left
  if (keys['s']) dy = 5; // Move down
  if (keys['d']) dx = 5; // Move right

  const currentTime = performance.now();
  if (keys['p'] && currentTime - lastPauseTime > pauseCooldown) {
    paused = !paused;
    lastPauseTime = currentTime;
  }

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
      player.takeDamage(5);
    }
  }

  // Randomly spawn enemies
  if (Math.random() < 0.01 && !paused && enemies.length < 1) { // Adjust the probability as needed
    enemies.push(Enemy.spawnRandom(player));
  }

  requestAnimationFrame(gameLoop); // Call gameLoop again on the next frame
}

function startGame() {
  createListeners();
  gameLoop();
}

startGame();