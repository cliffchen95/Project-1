const app = {
    players: [],
    zombies: [],
    citizens: [],
    ctx: null,
    timerID: null,
    timer: 0,
    positions: [],

    initializePlayer() {
        const player = new Player(400, 400, 2, 10);
        this.players.push(player);
    },
    startTimer() {
        this.timerID = setInterval(() => {
            this.timer++;
        }, 1000);
    },
    createCanvas() {
        const convas = document.createElement('canvas');
        const body = document.querySelector('body');
        body.appendChild(convas);
        convas.style.width = '1000px';
        convas.width = 1000;
        convas.style.height = '800px';
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
    spawnUnit(unit) {
        this.ctx.beginPath();
        this.ctx.arc(unit.x, unit.y, unit.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = unit.color;
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
        }
        for (zombie of app.zombies) {
            app.spawnUnit(zombie);
            zombie.getDirection(app.players[0]);
            zombie.move()
        }
        // for (citizen of this.citizens) {
        //     this.spawnUnit(citizen);
        // }
        window.requestAnimationFrame(app.animate);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.keyCode == 39) {
        console.log('right');
    } else if (event.keyCode == 37) {
        console.log('left');
    } else if (event.keyCode == 38) {
        console.log('up');
    } else if (event.keyCode ==40 ) {
        console.log('down');
    }
})