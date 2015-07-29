var Game = Game || {};

Game.AsteroidLevel = function (game) { };

Game.AsteroidLevel.prototype = (function () {
    var platforms,
        log,
        players,
        batmanKeys,
        supermanKeys,
        music,
        jump,
        run,
        bulletTime = 0,
        healthBars,
        playerCollisionTime = 0;

    function playFx(action) {

        switch (action) {
            case 'jump':
                jump.play();
                break;

            case 'run':
                run.play();
                break;
        }

    }

    function restartMusic() {
        music.restart();
    }

    function initPlatform() {
        platforms = this.game.add.group();
        platforms.enableBody = true;
        log = platforms.create(0, game.world.height - 10, 'log');
        log.scale.setTo(15, 1);
        log.body.immovable = true;
    }

    function reactToInput(player, directionKeys) {
        var sprite = player.sprite;
        sprite.body.velocity.x = 0;

        if (directionKeys.left.isDown) {
            sprite.body.velocity.x = -CONST.game.physics.playerXVelocity;

            if (sprite.body.touching.down) {
                sprite.animations.play('moveLeft');
                playFx('run');
            } else {
                sprite.animations.play('jumpLeft');
            }
        } else if (directionKeys.right.isDown) {
            sprite.body.velocity.x = CONST.game.physics.playerXVelocity;

            if (sprite.body.touching.down) {
                sprite.animations.play('moveRight');
                playFx('run');
            } else {
                sprite.animations.play('jumpRight');
            }
        } else {
            sprite.animations.stop();
        }

        if (directionKeys.up.isDown && sprite.body.touching.down) {
            playFx('jump');
            sprite.body.velocity.y = -CONST.game.physics.playerYVelocity;
        }
    }

    function updatePlayerBullets(player) {
        game.physics.arcade.overlap(platforms, player.bullets, function (bullet, platforms) {
            bullet.kill();
            player.removeBullet(bullet);
        }, null, this);
    }

    function checkForWinner() {
        if (players.batman.health <= 0 || players.superman.health <= 0) {
            game.state.start('GameOver');
        }
    }

    function detectCollisionWithOtherPlayer() {
        this.game.physics.arcade.collide(players.batman.sprite, players.superman.sprite, playersCollisionHandler);
    }

    function playersCollisionHandler() {
        var jumpingPlayer, attackedPlayer;
        var batmanY = players.batman.sprite.y;
        var supermanY = players.superman.sprite.y;
        if (batmanY === supermanY + players.superman.sprite.height) {
            jumpingPlayer = players.superman;
            attackedPlayer = players.batman;
        } else if (supermanY === batmanY + players.batman.sprite.height) {
            jumpingPlayer = players.batman;
            attackedPlayer = players.superman;
        } else {
            return;
        }

        var jumpingPlayerToString = jumpingPlayer === players.batman ? 'batman' : 'superman';
        var attackedPlayerToString = attackedPlayer === players.batman ? 'batman' : 'superman';
        if (game.time.now > playerCollisionTime) {
            stats[jumpingPlayerToString].jumping.score += 40;
            players[attackedPlayerToString].health -= 40;
            healthBars[attackedPlayerToString].setHealth(players[attackedPlayerToString].health / CONST.player.maxHealth);
            playerCollisionTime = game.time.now + 500;
        }
    }

    var asteroidLevel = {
        preload: function () {
            this.game.load.image('background', 'imgs/asteroidsBackground.jpg');
            this.game.load.image('log', 'imgs/log.png');
            this.game.load.image('greenTexture', 'imgs/greenTexture.png');
            this.game.load.image('redTexture', 'imgs/redTexture.png');
            this.game.load.audio('levelMusic', ['audio/jumpingLevelTheme.mp3']);
            this.game.load.audio('jump', 'audio/jump.mp3');
            this.game.load.audio('running', 'audio/running.mp3');
            this.game.load.spritesheet('batman', 'imgs/batmanSprite.png', 53, 48);
            this.game.load.spritesheet('superman', 'imgs/supermanSprite.png', 53, 55);
            this.game.load.spritesheet('bullet', 'imgs/EnemyBullet.png', 60, 60);

        },
        create: function () {
            music = this.game.add.audio('levelMusic');
            music.play();
            jump = this.game.add.audio('jump');
            run = this.game.add.audio('running');

            this.game.add.sprite(0, 0, 'background');
            healthBars = {
                batman: new HealthBar(20, 20, game),
                superman: new HealthBar(540, 20, game),
            };
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            initPlatform(this);

            batmanKeys = getBatmanKeys(this.game);
            supermanKeys = getSupermanKeys(this.game);

            players = this.game.add.group();
            players.enableBody = true;
            players.batman = Object.create(Player)
                .init(this.game.add.sprite(20, 0, 'batman', 0))
                .addPhysics(this, 0.2, 300, 280)
                .addAnimations([9, 10, 11, 12, 13, 14, 15, 16, 17], [0, 1, 2, 3, 4, 5, 6, 7, 8], [24, 25, 26, 27, 28, 29], [18, 19, 20, 21, 22, 23]);

            players.superman = Object.create(Player)
                .init(this.game.add.sprite(720, 12, 'superman', 12))
                .addPhysics(this, 0.2, 300, 280)
                .addAnimations([7, 8, 9, 10, 11, 12, 13], [0, 1, 2, 3, 4, 5, 6], [20, 21, 22, 23, 24, 25], [14, 15, 16, 17, 18, 19]);

            this.game.input.onDown.add(restartMusic, this);
        },
        update: function () {
            this.game.physics.arcade.collide(players.batman.sprite, platforms);
            this.game.physics.arcade.collide(players.superman.sprite, platforms);

            detectCollisionWithOtherPlayer();
            checkForWinner();

            reactToInput(players.batman, supermanKeys);
            reactToInput(players.superman, batmanKeys);
        }
    };

    return asteroidLevel;
} ());