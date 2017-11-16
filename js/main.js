
var WIDTH = 360;
var HEIGHT = 256;

var game = new Phaser.Game(WIDTH, 340, Phaser.CANVAS, 'game');

game.States = {};

game.States.boot = function() {

  this.preload = function() {
    if(typeof(GAME) !== "undefined") {
      this.load.baseURL = GAME + "/";
    }

    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.refresh();
    game.load.image('loading', 'assets/preloader.gif');
  };
  this.create = function() {
    game.state.start('preload');
  };
};

game.States.preload = function() {

  this.preload = function() {
    var preloadSprite = game.add.sprite(70, HEIGHT/2, 'loading');
    var progressText = game.add.text(WIDTH/2, HEIGHT/2-5, '0%', {
        fontSize: '16px',
        fill: '#ffffff'
    });
    progressText.anchor.setTo(0.4, 0.5); // 设置锚点，用于居中
    // 监听加载完一个文件的事件
    game.load.onFileComplete.add(function(progress) {
        progressText.text = progress + '%';
    });

    game.load.setPreloadSprite(preloadSprite);
    game.load.image('cover', 'assets/cover.jpg');
    game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 40, 2);
    game.load.spritesheet('man', 'assets/man.png', 16, 30, 20);
    game.load.spritesheet('mystery', 'assets/mystery.png', 16, 16, 4);
    game.load.spritesheet('monster', 'assets/monster.png', 16, 16, 2);
    game.load.spritesheet('grass', 'assets/grass.png', 32, 16, 3);
    game.load.spritesheet('flag', 'assets/flag.png', 16, 16, 4);
    game.load.spritesheet('gold', 'assets/gold.png', 16, 16, 3);
    game.load.image('wall', 'assets/wall.bmp');
    game.load.image('monsterDead', 'assets/monster-dead.png');
    game.load.image('manDead', 'assets/man-dead.png');
    game.load.image('mushroom', 'assets/mushroom.png');
    game.load.spritesheet('left', 'assets/left.png', 40, 40, 2);
    game.load.spritesheet('right', 'assets/right.png', 40, 40, 2);
    game.load.spritesheet('up', 'assets/up.png', 40, 40, 2);
    game.load.tilemap('map', 'assets/tilemaps/map.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'assets/tilemaps/tiles.png');
    game.load.audio('startBGM', 'assets/startbgm.mp3');
    game.load.audio('playBGM', 'assets/playbgm.mp3');
    game.load.audio('jump', 'assets/jump.mp3');
    game.load.audio('goldSound', 'assets/gold.mp3');
    game.load.audio('winSound', 'assets/win.mp3');
    game.load.audio('mushroomSound', 'assets/mushroom.mp3');
    game.load.audio('biggerSound', 'assets/bigger.mp3');

    // 监听加载完毕事件
    game.load.onLoadComplete.add(onLoad);
    // 最小展示时间，示例为3秒
    var deadLine = false;
    setTimeout(function() {
        deadLine = true;
    }, 1000);
    // 加载完毕回调方法
    function onLoad() {
        if (deadLine) {
            // 已到达最小展示时间，可以进入下一个场景
            setTimeout(() => {game.state.start('main');}, 200);
        } else {
            // 还没有到最小展示时间，1秒后重试
            setTimeout(onLoad, 200);
        }
    }

  };
};

game.States.main = function() {

  this.create = function() {
    // 封面图
    var cover = game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'cover');
    cover.scale.setTo(1, 1.3);
    // 开始按钮
    this.startbutton = game.add.button(70, 200, 'startbutton', this.onStartClick, this, 1, 1, 0);
    // 背景音乐
    this.normalback = game.add.sound('startBGM', 0.1, true);
    this.normalback.play();
  };

  this.onStartClick = function() {
    game.state.start('start');
    this.normalback.stop();
  };
};

game.States.start = function() {

  var arrowLeft, arrowRight, arrowUp = false;
  this.create = function() {
    // 设置背景色
    game.stage.backgroundColor = '#6888FF';
    // 启动物理引擎
    game.physics.startSystem(Phaser.ARCADE);

    // BGM
    this.playmusic = game.add.sound('playBGM', 0.2, true);
    this.playmusic.play();

    // 创建tilemap，指定每个tile的大小，16x16
    this.map = game.add.tilemap('map', 16, 16);
    // image添加上
    this.map.addTilesetImage('tiles');
    // 设置碰撞
    this.map.setCollisionBetween(0,11);
    this.map.setCollision(15);
    // layer
    this.layer = this.map.createLayer(0);
    this.layer.resizeWorld();

    // 地图资源
    // 问号箱
    this.mysteries = game.add.group();
    this.mysteries.enableBody = true;
    this.map.createFromTiles(15, null, 'mystery', this.layer, this.mysteries);
    this.mysteries.setAll('body.immovable', 'true');
    this.mysteries.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3], 3, true);
    this.mysteries.callAll('animations.play', 'animations', 'spin');
    // 金子
    this.golds = game.add.group();
    this.golds.enableBody = true;
    this.map.createFromTiles(17, -1, 'gold', this.layer, this.golds);
    this.golds.callAll('animations.add', 'animations', 'spin', [0, 1, 2], 5, true);
    this.golds.callAll('animations.play', 'animations', 'spin');
    this.goldSoundSound = game.add.sound('goldSound', 0.2, false);
    // 草
    this.grasses = game.add.group();
    this.map.createFromTiles(16, -1, 'grass', this.layer, this.grasses);
    this.grasses.callAll('animations.add', 'animations', 'blow', [0, 1, 2], 10, true);
    this.grasses.callAll('animations.play', 'animations', 'blow');
    // 旗子
    this.flag = game.add.sprite(198*16+9, 3*16+8, 'flag');
    this.flag.animations.add('move', [0,1,2,3], 12, true);
    this.flag.animations.play();
    // 怪物
    this.monsters = game.add.group();
    this.monsters.enableBody = true;
    this.map.createFromTiles(18, -1, 'monster', this.layer, this.monsters);
    this.monsters.callAll('animations.add', 'animations', 'move', [0, 1], 5, true);
    this.monsters.callAll('animations.play', 'animations', 'move');

    // 人物
    this.man = game.add.sprite(50, HEIGHT - 64, 'man');
    game.physics.arcade.enable(this.man);
    this.man.body.gravity.y = 500;                    //重力加速度
    this.man.body.collideWorldBounds = true;          //碰撞世界范围
    this.manSize = 0;                    // 小马里奥
    this.man.body.setSize(16, 16, 0, 14);// 碰撞范围
    this.man.anchor.setTo(0, 0.4667);    // 碰撞时计算角度点
    this.man.animations.add('right', [this.manSize+0,this.manSize+1,this.manSize+2,this.manSize+1], 14, true);//创建动画 数组为要播放的帧序号(精灵图) 12毫秒 是否循环
    this.man.animations.add('left', [this.manSize+7,this.manSize+6,this.manSize+5,this.manSize+6], 14, true);
    this.jumpSound = game.add.sound('jump', 0.2, false);
    this.biggerSound = game.add.sound('biggerSound', 0.2, false);

    this.manDirect = true; //朝向 右：true; 左：false
    // 键盘操作
    this.cursors = game.input.keyboard.createCursorKeys();
    // camera
    game.camera.follow(this.man);

    // 积分等文字
    var info = game.add.text(16, 16, 'MARIO', { font: '14px Arial', fill: '#ffffff' });
    info.fixedToCamera = true;


    // 创建虚拟按键
    var buttonleft = game.add.button(10, HEIGHT + 10, 'left', null, this, 1, 0, 1, 0);
    buttonleft.scale.setTo(1.4, 1.4);
    buttonleft.fixedToCamera = true;
    buttonleft.events.onInputOver.add(function(){arrowLeft=true;});
    buttonleft.events.onInputOut.add(function(){arrowLeft=false;});
    buttonleft.events.onInputDown.add(function(){arrowLeft=true;});
    buttonleft.events.onInputUp.add(function(){arrowLeft=false;});

    var buttonright = game.add.button(90, HEIGHT + 10, 'right', null, this, 1, 0, 1, 0);
    buttonright.scale.setTo(1.4, 1.4);
    buttonright.fixedToCamera = true;
    buttonright.events.onInputOver.add(function(){arrowRight=true;});
    buttonright.events.onInputOut.add(function(){arrowRight=false;});
    buttonright.events.onInputDown.add(function(){arrowRight=true;});
    buttonright.events.onInputUp.add(function(){arrowRight=false;});

    var buttonup = game.add.button(WIDTH - 70, HEIGHT + 10, 'up', null, this, 1, 0, 1, 0);
    buttonup.scale.setTo(1.4, 1.4);
    buttonup.fixedToCamera = true;
    buttonup.events.onInputOver.add(function(){arrowUp=true;});
    buttonup.events.onInputOut.add(function(){arrowUp=false;});
    buttonup.events.onInputDown.add(function(){arrowUp=true;});
    buttonup.events.onInputUp.add(function(){arrowUp=false;});

  };
  this.update = function() {
    game.physics.arcade.collide(this.man, this.mysteries, this.collectgoldSound, null, this);
    game.physics.arcade.collide(this.man, this.layer, this.killWall, null, this);
    game.physics.arcade.overlap(this.man, this.layer, this.flagFalling, null, this);
    game.physics.arcade.overlap(this.man, this.mushroom, this.eatMushroom, null, this);
    game.physics.arcade.overlap(this.man, this.golds, this.collectGold, null, this);

    if (!this.win) {
      // 左右走动
      if (this.cursors.left.isDown || arrowLeft) {
        this.manDirect = false;
        this.man.body.velocity.x = -130;
        this.man.animations.play('left');
      } else if (this.cursors.right.isDown || arrowRight) {
        this.manDirect = true;
        this.man.body.velocity.x = 130;
        this.man.animations.play('right');
      } else {
        this.man.body.velocity.x = 0;
        this.manDirect ? (this.man.frame = this.manSize+0) : (this.man.frame = this.manSize+7);
      }
      // 跳跃和蹲下
      if ((this.cursors.up.isDown || arrowUp) && (this.man.body.onFloor() || this.man.body.touching.down)) {
        this.man.body.velocity.y = -270;
        this.manDirect ? (this.man.frame = this.manSize+3) : (this.man.frame = this.manSize+4);
        this.jumpSound.play();
      } else if (this.cursors.down.isDown) {
        //
      }
      // 空中姿态
      if (!(this.man.body.onFloor() || this.man.body.touching.down)) {
        this.manDirect ? (this.man.frame = this.manSize+3) : (this.man.frame = this.manSize+4);
      }
      // 出边界
      this.man.body.onWorldBounds = new Phaser.Signal();
      this.man.body.onWorldBounds.add(function(man, up, down, left, right) {
          if (down) {
              man.kill();
          }
      });

    } else {
      // 胜利
      if (this.man.x >= 3162) {
        this.man.body.velocity.x = 0;
        if (this.man.body.velocity.y < 0) {
          this.man.body.velocity.y = 0;
        }
        // 旗子降落
        if(!this.onceFlag){
          var flagtween = game.add.tween(this.flag).to({y: 190}, 1000, Phaser.Easing.Linear.None, true);
          var winBGM = game.add.sound('winSound', 0.2);
          this.playmusic.stop();
          winBGM.play();
          this.onceFlag = true;
        }
        // 进城堡
        if (this.flag.y === 190) {    // 滑倒底后的动画
          if (this.man.x < 3320) {
            this.man.body.velocity.x = 130;
            this.man.animations.play('right');   
          } else {
            this.man.body.velocity.x = 0;
            this.man.frame = this.manSize+9; 
          }
        } else {
          this.man.frame = this.manSize+8;
        }
      }
    }

  // 吃问号箱
  this.collectgoldSound = function(man, item) {
    //console.log(game.physics.arcade.angleBetween(man, item));
    if ((game.physics.arcade.angleBetween(man, item) < -0.78) && (game.physics.arcade.angleBetween(man, item) > -2.36)){
      console.log(item);

      if (item.position.x === 336) {
        // 蘑菇出现
        this.mushroom = game.add.sprite(item.x, item.y - 16, 'mushroom');
        game.physics.arcade.enable(this.mushroom);
        var mushroomSound = game.add.sound('mushroomSound', 0.2);
        mushroomSound.play();
      } else {
        // 金币冒出来
        var gold = game.add.sprite(item.x, item.y - 16, 'gold');
        gold.animations.add('move', [0,1,2], 5, true);
        gold.animations.play('move');
        this.goldSoundSound.play();
        // 金币动画
        var tween = game.add.tween(gold).to({y: gold.y - 50}, 100, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function(){gold.destroy();}, this);
      }
      item.destroy();
    }
  };
  // 吃金子
  this.collectGold = function(man, gold) {
    gold.destroy();
    this.goldSoundSound.play();
  };
  // 吃蘑菇
  this.eatMushroom = function(man, mushroom) {
    this.manSize = 10;                    // 大马里奥
    this.man.body.setSize(16, 30, 0, 0);  // 碰撞范围
    this.man.anchor.setTo(0, 0);          // 碰撞时计算角度点
    this.man.animations.add('right', [this.manSize+0,this.manSize+1,this.manSize+2,this.manSize+1], 14, true);//创建动画 数组为要播放的帧序号(精灵图) 12毫秒 是否循环
    this.man.animations.add('left', [this.manSize+7,this.manSize+6,this.manSize+5,this.manSize+6], 14, true);
    this.mushroom.kill();
    this.biggerSound.play();
  };

  // 旗子降落
  this.flagFalling = function(man, item) {
    if (item.index === 13) {
      this.win = true;
    }
  };

  // 大人撞碎墙
  this.killWall = function(man, item) {
    if (item.index === 11) {
      if (   (game.physics.arcade.angleToXY(man, item.worldX, item.worldY) < -0.78)
          && (game.physics.arcade.angleToXY(man, item.worldX, item.worldY) > -2.36) 
          && (this.manSize === 10)
          ){
        this.map.removeTile(item.x, item.y);
      }
    }
  };

  // this.render = function(){
  //    game.debug.body(this.man);
  // }
};


game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);
game.state.add('start', game.States.start);

game.state.start('boot');