var _ = require('underscore');


function Game(opts){
    this.deck = opts.deck;
    this.players = opts.players;

}
Game.prototype.start = function() {

    this.turnCount = 0;
    this.currentPlayerIndex = 0;
    this.direction = +1;

    do{
        this.resetPlayersDecks();
        this.deck = _.shuffle(this.deck);
        this.deal(7);

        // turn the first card from the deck
        this.card = this.deck.shift();

    }while(this.card.color === 'black');


};

Game.prototype.play = function() {
    this.turnCount++;

    if(this.card.value === 'STOP'){
        this.nextPlayer();
    }

    var player = this.players[this.currentPlayerIndex];
    var playerCard = player.play(this);


    // console.log('Turn #'+this.turnCount+' ('+this.deck.length+' in game deck)');
    // console.log('  '+player);
    // console.log('  '+playerCard);


    // put previous card back in the deck
    this.deck.push(this.card);
    // update current card
    this.card = playerCard;

    if(this.card.value === 'REVERSE'){
        this.direction = this.direction===1 ? -1 : 1;
        this.nextPlayer();
    }else if(this.card.addsCards){
        player = this.nextPlayer();
        for(var i=0;i<this.card.addsCards;i++){
            player.deck.push(this.deck.shift());
        }
    }else{
        this.nextPlayer();
    }


    // have player won yet ?
    if(player.deck.length === 0){
        this.winner = player;
        this.winner.handsWon++;
        this.winner.addScore(this.players.reduce(function(total, player){
            total += player.getPoints();
            return total;
        }, 0));
        console.log('Winner!', player);
    }

};


Game.prototype.nextPlayer = function() {
    // next player according to direction
    this.currentPlayerIndex += this.direction;

    // wrap
    if(this.currentPlayerIndex < 0){
        this.currentPlayerIndex = this.players.length - 1;
    }else if(this.currentPlayerIndex === this.players.length){
        this.currentPlayerIndex = 0;
    }

    return this.players[this.currentPlayerIndex];
};

Game.prototype.getCurrentPlayer = function() {
    return this.players[this.currentPlayerIndex];
};

Game.prototype.resetPlayersDecks = function() {
    this.players.forEach(function(p){
        this.deck = this.deck.concat(p.deck);
        p.deck = [];
    }, this);
};


Game.prototype.deal = function(nbCards) {
    var playerI = 0;
    for(var i=0; i<nbCards*this.players.length; i++){

        this.players[playerI].addCard(this.deck.shift());

        playerI++;
        if(!this.players[playerI]){
            playerI = 0;
        }
    }
};

Game.prototype.debug = function() {
    //console.log('Deck:');
    //console.log(this.deck);
    console.log('Players:');
    this.players.forEach(function(p){
        console.log('- '+p);
    });
};



module.exports = Game;
