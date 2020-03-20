const app = {
  numOfPlayer: 0,
  players: [],
  zombies: [],
  citizens: [],
  ctx: null,
  timerID: null,
  timer: 0,
  hasGun: false,
  gun: {
    range: 300,
    damage: 0,
    position: { x: 0, y: 0 },
    direction: { x: 0, y: 0 },
    bullets: [],
    fireBullet() {
      const bullet = new Bullet({ x: this.position.x, y: this.position.y }, { x: this.direction.x, y: this.direction.y }, this.range);
      this.bullets.push(bullet);
    }
  },

  sword: {
    range: 0,
    damage: 0,
    direction: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 },
    swing: 0
  },
  initializePlayer(weapon) {
    const x = Math.random() * 50 + 400;
    const y = Math.random() * 50 + 300;
    const player = new Player(x, y, 2, 10, weapon);
    if (weapon == 'gun') {
      player['gun'] = this.gun;
      this.hasGun = true;
      player.hasGun = true;
    } else {
      player['sword'] = this.sword;
    }
    this.players.push(player);
  },
  startTimer() {
    this.timerID = setInterval(() => {
      if (this.timer % 5 == 2) {
        const location = this.spawnZoneZombie();
        this.createZombie(location.i, location.j);
      }
      if (this.timer % 7 == 1) {
        const location = this.spawnZoneCitizen(this.timer % 2);
        this.createCitizen(location.x, location.y);
      }
      this.timer++;
    }, 1000);
  },
  spawnZoneZombie() {
    let x = Math.floor(Math.random() * 980) + 10;
    let y = Math.floor(Math.random() * 780) + 10;
    while ((x >= 200 && x < 400 && y >= 500 && y < 600) || (x >= 600 && x < 800 && y >= 200 && y < 300)) {
      x = Math.floor(Math.random() * 980) + 10;
      y = Math.floor(Math.random() * 780) + 10;
    }
    return {
      i: x,
      j: y
    }
  },
  spawnZoneCitizen(n) {
    let i;
    let j;
    if (n == 0) {
      i = Math.floor(Math.random() * 200) + 200;
      j = Math.floor(Math.random() * 100) + 500;
    } else {
      i = Math.floor(Math.random() * 200) + 600;
      j = Math.floor(Math.random() * 100) + 200;
    }
    return {
      x: i,
      y: j
    }
  },
  createCanvas() {
    const convas = document.createElement('canvas');
    const body = document.querySelector('body');
    body.appendChild(convas);
    convas.style.width = '800px';
    convas.width = 1000;
    convas.style.height = '600px';
    convas.height = 800;
    this.ctx = convas.getContext('2d');
  },
  clearCanvas() {
    app.ctx.clearRect(0, 0, 1000, 800);
  },
  createZombie(x, y) {
    const zombie = new Zombie(x, y, 0.5, 10);
    this.zombies.push(zombie);
  },
  createCitizen(x, y) {
    const citizen = new Citizen(x, y, 0.4, 10);
    this.citizens.push(citizen);
  },
  spawnUnit(unit) {
    this.ctx.beginPath();
    this.ctx.arc(unit.x, unit.y, unit.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = unit.color;
    this.ctx.fill();
  },
  getClosestUnit(zombie) {
    let distance = Number.POSITIVE_INFINITY;
    let unit = null;
    for (player of this.players) {
      if (distance > zombie.getDistance(player)) {
        distance = zombie.getDistance(player);
        unit = player;
      }
    }
    for (citizen of this.citizens) {
      if (distance > zombie.getDistance(citizen)) {
        distance = zombie.getDirection(citizen);
        unit = citizen;
      }
    }
    return unit;
  },
  getClosestZombie(citizen) {
    let distance = Number.POSITIVE_INFINITY;
    let unit = null;
    for (zombie of this.zombies) {
      if (distance > citizen.getDistance(citizen)) {
        distance = citizen.getDistance(zombie);
        unit = zombie;
      }
    }
    return unit;
  },
  citizenAttacked(zombie) {
    for (let i = 0; i < this.citizens.length; i++) {
      if (zombie.checkCollision(this.citizens[i])) {
        this.zombies.push(this.citizens[i].turnIntoZombie());
        this.citizens.splice(i, 1);
        return;
      }
    }
  },
  displayWeapon(player) {
    const direction = player.directionFacing;
    if (player.weapon == 'sword') {
      this.ctx.lineWidth = 3;
      const angle = Math.PI / 6;
      player.sword.startPosition.x = player.x + direction.x * 12;
      player.sword.startPosition.y = player.y + direction.y * 12;
      if (player.sword.swing == 0) {
        player.sword.endPosition.x = player.x + direction.x * 42;
        player.sword.endPosition.y = player.y + direction.y * 42;
      } else if (player.sword.swing == 1) {
        player.sword.endPosition.x = player.x + direction.x * 42 + 15 * Math.sin(angle) * direction.y;
        player.sword.endPosition.y = player.y + direction.y * 42 + 15 * Math.cos(angle) * direction.x;
        player.sword.swing = 2;
      } else if (player.sword.swing == 2) {
        player.sword.endPosition.x = player.x + direction.x * 42 - 15 * Math.sin(angle) * direction.y;
        player.sword.endPosition.y = player.y + direction.y * 42 - 15 * Math.cos(angle) * direction.x;
        player.sword.swing = 0;
      }
      player.sword.direction = direction;
      this.ctx.beginPath();
      this.ctx.moveTo(player.sword.startPosition.x, player.sword.startPosition.y);
      this.ctx.lineTo(player.sword.endPosition.x, player.sword.endPosition.y);
      this.ctx.stroke();
    }
    if (player.weapon == 'gun') {
      this.ctx.lineWidth = 5;
      player.gun.position.x = player.x + direction.x * 30;
      player.gun.position.y = player.y + direction.y * 30;
      player.gun.direction = direction;
      this.ctx.beginPath();
      this.ctx.moveTo(player.x + direction.x * 14, player.y + direction.y * 14);
      this.ctx.lineTo(player.x + direction.x * 30, player.y + direction.y * 30);
      this.ctx.moveTo(player.x + direction.x * 14, player.y + direction.y * 14);
      if (direction.x == 0) {
        this.ctx.lineTo(player.x + direction.x * 14 + direction.y * 10, player.y + direction.y * 14);
      } else if (direction.y == 0) {
        this.ctx.lineTo(player.x + direction.x * 14, player.y + direction.y * 14 + direction.x * 10);
      } else {
        this.ctx.lineTo(player.x + direction.x * 14 - direction.y * 10, player.y + direction.y * 14 + direction.x * 14);
      }
      this.ctx.stroke();
    }
  },
  drawBullet(bullet) {
    this.ctx.beginPath();
    this.ctx.arc(bullet.position.x, bullet.position.y, 2, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
  },
  animate() {
    app.clearCanvas();
    app.ctx.beginPath();
    app.ctx.font = '30px serif';
    app.ctx.fillStyle = '#ffffff'
    app.ctx.fillText(`Time to Daylight: ${app.timer}`, 700, 30)
    for (player of app.players) {
      app.spawnUnit(player);
      app.displayWeapon(player);
      player.move();
      if (player.hasGun) {
        for (bullet of player.gun.bullets) {
          app.drawBullet(bullet);
          bullet.move();
          if (bullet.atMaxRange) {
            player.gun.bullets.shift();
          }
          for (zombie of app.zombies) {
            if (bullet.hit(zombie)) {
              let index = app.zombies.indexOf(zombie);
              app.zombies.splice(index, 1);
              index = player.gun.bullets.indexOf(bullet);
              player.gun.bullets.splice(index, 1);
            }
          }
        }
      }
    }
    for (zombie of app.zombies) {
      app.spawnUnit(zombie);
      zombie.getDirection(app.getClosestUnit(zombie));
      zombie.move();
      app.citizenAttacked(zombie);
    }
    for (citizen of app.citizens) {
      app.spawnUnit(citizen);
      citizen.setDirection(app.getClosestZombie(citizen));
      citizen.move();
    }
    window.requestAnimationFrame(app.animate);
  }
}

document.addEventListener('keydown', (event) => {
  app.players[0].direction = {x: 0, y: 0};
  if (event.keyCode == 39) {
    app.players[0].direction.x = 1;
    app.players[0].setDirectionFacing(event);
  } else if (event.keyCode == 37) {
    app.players[0].direction.x = -1;
    app.players[0].setDirectionFacing(event);
  } else if (event.keyCode == 38) {
    app.players[0].direction.y = -1;
    app.players[0].setDirectionFacing(event);
  } else if (event.keyCode == 40) {
    app.players[0].direction.y = 1;
    app.players[0].setDirectionFacing(event);
  }
  if (event.keyCode == 32) {
    app.players[0].sword.swing = 1;
  }
})
document.addEventListener('keyup', (event) => {
  if (event.keyCode == 39) {
    app.players[0].direction.x = 0;
  } else if (event.keyCode == 37) {
    app.players[0].direction.x = 0;
  } else if (event.keyCode == 38) {
    app.players[0].direction.y = 0;
  } else if (event.keyCode == 40) {
    app.players[0].direction.y = 0;
  }
})
document.addEventListener('mousemove', (event) => {
  if (app.players[0]) {
    app.players[0].setDirectionFacing(event);
  }
})

document.addEventListener('click', (event) => {
  const body = document.querySelector('body');
  if (event.target.id == 'start-game') {
    event.target.remove();
    const onePlayer = document.createElement('button');
    const twoPlayer = document.createElement('button');
    onePlayer.innerText = 'one player';
    twoPlayer.innerText = 'two players';
    body.appendChild(onePlayer);
    body.appendChild(twoPlayer);
  }
  if (event.target.innerText == 'one player') {
    const buttons = document.querySelectorAll('button');
    for (button of buttons) {
      button.remove();
    }
    const sword = document.createElement('button');
    const gun = document.createElement('button');
    sword.innerText = 'sword';
    gun.innerText = 'gun';
    body.appendChild(sword);
    body.appendChild(gun);
    app.numOfPlayer = 1;
  }
  if (event.target.innerText == 'two players') {
    const buttons = document.querySelectorAll('button');
    for (button of buttons) {
      button.remove();
    }
    const sword = document.createElement('button');
    const gun = document.createElement('button');
    sword.innerText = 'sword';
    gun.innerText = 'gun';
    body.appendChild(sword);
    body.appendChild(gun);
    app.numOfPlayer = 2;
  }
  if (event.target.innerText == 'gun' || event.target.innerText == 'sword') {
    const weapons = ['gun', 'sword'];
    app.initializePlayer(event.target.innerText);
    if (app.numOfPlayer == 2) {
      const index = weapons.indexOf(event.target.innerText);
      weapons.splice(index, 1);
      app.initializePlayer(weapons[0])
    }
    const buttons = document.querySelectorAll('button');
    for (button of buttons) {
      button.remove();
    }
    app.createCanvas();
    app.startTimer();
    app.animate();
  }
  if (app.hasGun) {
    for (player of app.players) {
      if (player.hasGun) {
        player.gun.fireBullet();
      }
    }
  }
})

// app.initializePlayer();
// app.createCanvas();
// app.startTimer();
// app.animate();