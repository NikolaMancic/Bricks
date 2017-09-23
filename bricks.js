var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var CW = canvas.width;
var CH = canvas.height;

var ROWS = 18;
var COLS = 20;
var BW = CW / COLS;
var BH = BW / 2;

var Brick = function(x, y, c) {
    'use strict';

    this.x = x;
    this.y = y;
    this.color = c;
    this.w = BW;
    this.h = BH;

    this.path = new Path2D();
    this.path.rect(this.x, this.y, this.w, this.h);
};

Brick.prototype.draw = function() {
    'use strict';

    ctx.fillStyle = this.color;
    ctx.fill(this.path);
};

var bricks = (function() {
    'use strict';

    var b = [];

    var hue = 0;
    var saturation = 50;
    var lightness = 30;

    for(var row = 0; row < ROWS; row++) {
        b.push([]);

        for(var col = 1; col < 19; col++) {
            b[row].push(new Brick(col * BW, row * BH + BH * 2,
                                  'hsl(' + hue + ',' + saturation + '%,' + lightness + '%)'));
            hue += 340 / COLS;
        }

        lightness += 2;
        hue = 0
    }

    return b;
})();

var paddle = (function() {
    'use strict';

    var w = CW / 10;
    var h = w / 4;

    var x = CW / 2 - w / 2;
    var y = CH - h * 2;

    var path = new Path2D();
    path.rect(x, y, w, h);

    return {
        x: x, y: y, w: w, h: h,
        path: path,

        color: 'dimgray',

        draw: function() {
            ctx.fillStyle = this.color;
            ctx.fill(this.path);
        },

        move: function(evt) {
            this.x = evt.clientX - canvas.offsetLeft;
            this.path = new Path2D();
            this.path.rect(this.x, this.y, this.w, this.h);
        }
    }
})();

var ball = {
    moving: false,

    x: paddle.x + paddle.w * 0.75,
    y: paddle.y,

    r: 5,
    color: 'red',

    speed: 0,
    movesX: 0,
    movesY: 0,

    minAngle: -175,
    maxAngle: -5,

    angleRad: 0,
    angleDeg: 0,

    reset: function() {
        'use strict';

        this.x = paddle.x + paddle.w * 0.75;
        this.y = paddle.y;

        this.speed = 4;

        this.angleDeg = -45;
        this.adjustAngle();
    },

    adjustAngle: function() {
        'use strict';

        this.angleRad = this.angleDeg * Math.PI / 180;

        this.movesX = Math.cos(this.angleRad) * this.speed;
        this.movesY = Math.sin(this.angleRad) * this.speed;
    },

    launch: function() {
        'use strict';

        if(!this.moving) {
            this.moving = true;
            this.adjustAngle();
        }
    },

    update: function() {
        'use strict';

        if(this.moving) {
            this.x += this.movesX;
            this.y += this.movesY;

            if(this.x > CW || this.x < 0) {
                this.angleDeg = 180 - this.angleDeg;
                this.adjustAngle();
            }
            else if(this.y > CH || this.y < 0) {
                this.angleDeg = 360 - this.angleDeg;
                this.adjustAngle();
            }
        } else {
            this.x = paddle.x + paddle.w * 0.75;
            this.y = paddle.y;
        }
    },

    paddleCollision: function() {
        'use strict';

        if(ctx.isPointInPath(paddle.path, this.x, this.y)) {
            this.angleDeg = this.minAngle + (this.x - paddle.x) * (this.maxAngle - this.minAngle) / paddle.w;
            this.adjustAngle();
        }
    },

    brickCollision: function(brick) {
        'use strict';

        if(ctx.isPointInPath(brick.path, this.x, this.y)) {

            if(this.x < brick.x + Math.abs(this.movesX) || this.x > brick.x + brick.w - Math.abs(this.movesX * 2)) {
                // vertical collision
                this.angleDeg = 180 - this.angleDeg;
            } else {
                // horizontal collision
                this.angleDeg = 360 - this.angleDeg;
            }

            this.adjustAngle();

            return true
        } else {
            return false;
        }
    },

    draw: function() {
        'use strict';


        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
};

function update() {
    'use strict';

    ball.paddleCollision();

    for(var row = 0; row < bricks.length; row++) {
        for(var col = 0; col < bricks[row].length; col++) {
            if(ball.brickCollision(bricks[row][col])) {
                bricks[row].splice(col, 1);
            }
        }
    }

    ball.update();

    draw();

    window.requestAnimationFrame(update);
}

function draw() {
    'use strict';

    ctx.clearRect(0, 0, CW, CH);

    for(var row = 0; row < bricks.length; row++) {
        for(var col = 0; col < bricks[row].length; col++) {
            bricks[row][col].draw();
        }
    }

    paddle.draw();
    ball.draw();
}

canvas.addEventListener('mousemove', paddle.move.bind(paddle));
window.addEventListener('click', ball.launch.bind(ball));
ball.reset();
update();
