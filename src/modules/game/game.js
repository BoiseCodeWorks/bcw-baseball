(function() {
  'use strict';

  angular
    .module('app')
    .controller('GameController', GameController);

  function GameController(Positions, Games, Teams, Players) {
    //Lets just work with the one game we have
    var gameId = 1;
    Games.find(gameId).then((data) => {
      this.game = data;
      console.dir(data);
    })

    Teams.findAll().then((data) => {
      this.teams = data;
      console.dir(data);
    })

    Players.findAll().then((data) => {
      this.players = data;
      console.dir(data);
    })

    this.loadBases = () => {
      var hp = this.game.homeTeam.players;
      var ap = this.game.awayTeam.players;
      hp[0].position = 'atThird';
      hp[1].position = 'atSecond';
      hp[2].position = 'atFirst';
      hp[3].position = 'bench';
      hp[4].position = 'bench';
      hp[5].position = 'atBatRight';
      hp[6].position = 'bench';
      hp[7].position = 'bench';
      hp[8].position = 'bench';
      hp[9].position = 'bench';
      hp[10].position = 'bench';
      hp[11].position = 'bench';
      
      ap[0].position = 'first';
      ap[1].position = 'second';
      ap[2].position = 'third';
      ap[3].position = 'bench';
      ap[4].position = 'short';
      ap[5].position = 'center';
      ap[6].position = 'right';
      ap[7].position = 'bench';
      ap[8].position = 'bench';
      ap[9].position = 'left';
      ap[10].position = 'bench';
      ap[11].position = 'pitcher';
      
      
      Players.saveAll();
    }
    
    this.saveAll = () =>{
      
      Games.getAll().forEach(x => x.DSSave())
      Teams.getAll().forEach(x => x.DSSave())
      Players.getAll().forEach(x => x.DSSave().catch((d) =>{
        console.dir(d);
        debugger;
      }))
    }

    this.getPlayerClass = (player) => {
      var homeClass = player.team === this.game.homeTeam ? 'team-home' : 'team-away';

      //home team always at bat....
      var posClass = '';
      if (player.position && Positions[player.position]) {
        posClass = Positions[player.position].className;
      } else {
        posClass = Positions.bench.className;
      }

      return [homeClass, posClass];
    }

  }
})();