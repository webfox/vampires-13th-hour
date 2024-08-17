// src/main.js

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.weapon = null; // The player starts without a weapon
    this.attacking = false;
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

  updatePosition(dx, dy) {
    this.x += dx;
    this.y += dy;
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

class Weapon {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.equipped = false;
    this.attacking = false;
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
    this.attacking = true;
    setTimeout(() => {
      this.attacking = false;
    }, 500);
  }

  startSwing() {
    this.angle = 0; // Start angle
    const swingDuration = 500; // Duration of the swing in milliseconds
    const startTime = performance.now();

    const animateSwing = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / swingDuration, 1);
      this.angle = this.angle+ (Math.PI / 15) * progress; // Animate from -45 to +45 degrees

      if (progress < 1) {
        requestAnimationFrame(animateSwing);
      } else {
        this.angle = 0; // Reset angle after swing
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

const keys = {};

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

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const player = new Player(0, 0); // Initialize player at position (0, 0)
const weapons = [
  new Weapon(100, 100, 'axe'),
  new Weapon(300, 300, 'axe'),
  new Weapon(400, 400, 'axe'),
];


function gameLoop() {
  let dx = 0, dy = 0;
  if (keys['w']) dy = -5; // Move up
  if (keys['a']) dx = -5; // Move left
  if (keys['s']) dy = 5; // Move down
  if (keys['d']) dx = 5; // Move right

  player.updatePosition(dx, dy);

  player.render(ctx, player.getX(), player.getY());

  for (const weapon of weapons) {
    if (player.checkCollision(weapon)) {
      if (keys['e']) {
        player.pickUpWeapon(weapon);
      }
    }
    weapon.render(ctx, player.getX(), player.getY());
  }

  requestAnimationFrame(gameLoop); // Call gameLoop again on the next frame
}

function startGame() {
  gameLoop(); // Start the game loop
}

startGame();