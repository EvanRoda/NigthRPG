var createNewMap = function(){
    var map = [];
    for(var y=0;y<15; y++){
        map[y] = [];
        for(var x=0; x<15; x++){
            map[y][x] = [{
                title: 'wall',
                char: '#',
                solid: true
            }];
        }
    }
    var c={};
    var i=0;
    for(var j=0; j<20; j++){
        c = {x:7,y:7};
        for(i=0; i<30; i++){
            if(map[c.y] && map[c.y][c.x]){
                map[c.y][c.x] = [{title: 'floor', char: '.', solid: false}];
                c = _.random(0, 1) ? {y: c.y + _.random(-1, 1), x: c.x} : {y: c.y, x: c.x + _.random(-1, 1)};
            }else{
                i=36;
            }
        }
    }
    return map;
};

var createEnemies = function(level, map){
    var x=0;
    var y=0;
    var enemies = [];
    var enemy={};
    for(var i = 0; i<level; i++){
        enemy={};
        while(!enemy.power){
            x = _.random(14);
            y = _.random(14);
            if(map[y] && map[y][x] && map[y][x][0].char!='#'){
                enemy.power = level + _.random(level*(-1), level);
                enemy.char = enemy.power > level ? 'O' : 'o';
                enemy.title = 'slug';
                enemy.x = x;
                enemy.y = y;
            }
        }
        enemies[i] = enemy;
    }
    return enemies;
};

var createItem = function(x, y, level){
    var items = [
        {
            title: 'helm',
            char: '^',
            solid: false
        },{
            title: 'armor',
            char: 'Y',
            solid: false
        },{
            title: 'legs',
            char: 'П',
            solid: false
        },{
            title: 'boots',
            char: '"',
            solid: false
        },{
            title: 'shield',
            char: '*',
            solid: false
        },{
            title: 'sword',
            char: '/',
            solid: false
        },{
            title: 'poison',
            char: '&',
            solid: false
        }
    ];
    var item = items[_.random(6)];
    item.x = x;
    item.y = y;
    item.power = item.title == 'poison' ? _.random(-1, 1) : level + _.random((-1)*level, level);
    return item;
};

var createItems = function(map, level){
    var x = 0;
    var y = 0;
    var item = {};
    while(typeof(item.power)=='undefined' ){
        x = _.random(14);
        y = _.random(14);
        if(map[y][x][0].char!='#'){
            item = createItem(x, y, level);
        }
    }
    return item;
};

var dropItem = function(){
    if(!(_.random(0,2))){
        game.items.push(createItem(game.hero.x, game.hero.y, game.level));
    }
};

var getMapView = function(source_map, enemies, items, hero){
    var map = $.extend(true, [], source_map);
    var mapView = [];
    var string ='';
    _.each(items, function(item){
        map[item.y][item.x].unshift(item);
    });
    _.each(enemies, function(enemy){
        map[enemy.y][enemy.x].unshift(enemy);
    });
    map[hero.y][hero.x].unshift(hero);
    _.each(map, function(row, index){
        string = '';
        _.each(row, function(cell){
            string = string + cell[0].char;
        });
        mapView[index] = string;
    });
    outputMapData(mapView);
};

var outputMapData = function(mapView){
    var htmlString = '<br>';
    var messageString = '';
    var actionString = '';
    var heroEquip = '<br><span>HERO '+ game.hero.power +'</span><br><br>' +
        '<span>^ helm '+ game.hero.helm +'</span><br>'+
        '<span>Y armor '+ game.hero.armor +'</span><br>'+
        '<span>П legs '+ game.hero.legs +'</span><br>'+
        '<span>" boots '+ game.hero.boots +'</span><br>'+
        '<span>/ sword '+ game.hero.sword +'</span><br>'+
        '<span>* shield '+ game.hero.shield +'</span>';
    var cell = _.findWhere(game.items, {x: game.hero.x, y: game.hero.y});

    _.each(mapView, function(row){
        htmlString += '<span>'+ row +'</span><br>';
    });
    _.each(game.messages, function(str){
        messageString += '<span>'+ str +'</span><br>';
    });
    console.log(cell);
    if(cell){
        if(cell.title == 'helm' || cell.title == 'armor' || cell.title == 'legs' || cell.title == 'boots'|| cell.title == 'sword' || cell.title == 'shield'){
            if(cell.power > game.hero[cell.title]){
                actionString = '[e] - take ' + cell.title + ' ' + cell.power;
            }else{
                actionString = '[e] - destroy ' + cell.title + ' ' + cell.power;
            }
        }else if(cell.title == 'poison'){
            actionString = '[e] - drink poison';
        }
    }else{
        actionString = 'Nothing here';
    }

    console.log(heroEquip);
    $('#game-screen').html(htmlString);
    $('#score').html('Score: ' + game.score);
    $('#messages').html(messageString);
    $('#hero').html(heroEquip);
    $('#action').html('<br><br><br>' + actionString);
};

var moveObject = function(obj, direction){
    var x = obj.x;
    var y = obj.y;
    if(direction==37)
        x = obj.x - 1;
    else if(direction==38)
        y = obj.y - 1;
    else if(direction==39)
        x = obj.x + 1;
    else if(direction==40)
        y = obj.y + 1;

    if(game.map[y] && game.map[y][x] && !game.map[y][x][0].solid){
        obj.x = x;
        obj.y = y;
    }
};

var enemyCollisionDetect = function(enemy, index){
    if(game.hero.x == enemy.x && game.hero.y == enemy.y){
        var power = game.hero.power + game.hero.helm + game.hero.armor + game.hero.legs + game.hero.boots + game.hero.sword + game.hero.shield;
        if(power >= enemy.power){
            newMessage(enemy.title + ' ' + enemy.power + ' defeated!');
            game.enemies.splice(index, 1);
            dropItem();
        }else{
            newMessage('You are defeated by ' + enemy.title + ' ' + enemy.power);
        }
    }
};

var heroCollisionDetect = function(){
    var total_enemy_power = 0;
    var power = game.hero.power + game.hero.helm + game.hero.armor + game.hero.legs + game.hero.boots + game.hero.sword + game.hero.shield;
    _.each(game.enemies, function(enemy){
        total_enemy_power += (enemy.x == game.hero.x && enemy.y == game.hero.y) ? enemy.power : 0;
    });
    if(power >= total_enemy_power){
        game.enemies = _.reject(game.enemies, function(enemy){
            return (enemy.x == game.hero.x && enemy.y == game.hero.y);
        });
        dropItem();
        newMessage('win');
    }else{
        newMessage('You are defeated by enemies');
    }
};

var newMessage = function(str){
    game.messages.splice(-1, 1);
    game.messages.unshift(str);
};

var oneGameStep = function(key_code){
    var cell = _.findWhere(game.items, {x: game.hero.x, y: game.hero.y});
    if(key_code == 69){
        if(cell){
            if(cell.title == 'helm' || cell.title == 'armor' || cell.title == 'legs' || cell.title == 'boots'|| cell.title == 'sword' || cell.title == 'shield'){
                if(cell.power > game.hero[cell.title]){
                    game.score += game.hero[cell.title];
                    game.hero[cell.title] = cell.power;
                    game.items = _.reject(game.items, function(item){
                        return (item.x == cell.x && item.y == cell.y && item.title == cell.title && item.power == cell.power);
                    });
                }else{
                    game.score += cell.power;
                    game.items = _.reject(game.items, function(item){
                        return (item.x == cell.x && item.y == cell.y && item.title == cell.title && item.power == cell.power);
                    });
                }
            }else if(cell.title == 'poison'){
                game.hero.power += cell.power;
                game.items = _.reject(game.items, function(item){
                    return (item.x == cell.x && item.y == cell.y && item.title == cell.title && item.power == cell.power);
                });
            }
        }
    }else if(key_code == 32){
        if(!game.enemies.length){
            game.messages=['','','',''];
            game.items = [];
            game.level += 1;
            game.map = createNewMap();
            game.enemies = createEnemies(game.level, game.map);
            game.items[0] = createItems(game.map, game.level);
            game.hero.x = 7;
            game.hero.y = 7;
            getMapView(game.map, game.enemies, game.items, game.hero);
        }
    }else{
        moveObject(game.hero, key_code);
        if(_.findWhere(game.enemies, {x: game.hero.x, y: game.hero.y})){
            heroCollisionDetect();
        }
    }
    _.each(game.enemies, function(enemy, index){
        moveObject(enemy, _.random(37, 40));
        enemyCollisionDetect(enemy, index);
    });

    getMapView(game.map, game.enemies, game.items, game.hero);
};

var keyPressed = function(e) {
    var key_code;
    if (e) {
        key_code = e.which;
    }
    else if (window.event) {
        key_code = window.event.keyCode;
    }
    oneGameStep(key_code);
    console.log(key_code);
};
document.onkeydown = keyPressed;

var game = {};

$( document ).ready(function() {
    document.onkeydown = keyPressed;
    game.messages=['','','',''];
    game.items = [];
    game.level = 1;
    game.score = 0;
    game.map = createNewMap();
    game.enemies = createEnemies(game.level, game.map);
    game.items[0] = createItems(game.map, game.level);
    game.hero = {
        x: 7,
        y: 7,
        power: 0,
        char: '@',
        helm: 0,
        armor: 0,
        legs: 0,
        boots: 0,
        shield:0,
        sword: 1
    };
    getMapView(game.map, game.enemies, game.items, game.hero);
});