(function() {
  'use strict';

  angular
    .module('app')
    .directive('roster', Roster);

  Roster.$inject = [];
  function Roster() {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      bindToController: true,
      controller: RosterController,
      controllerAs: 'rc',
      restrict: 'E',
      templateUrl: '/modules/roster/roster.html',
      scope: {
        team: '=',
        isHome: '='
      }
    };
    return directive;

  }
  /* @ngInject */
  function RosterController(Positions, Players) {
    //see if we have the players array and if it is empty
    if (this.team && this.team.players && this.team.players.length == 0) {
      //load the players for the team.
      this.team.DSLoadRelations('player').then((data) => {
        //if no players found. Create them.
        if (data && data.length == 0) {
          this.addPlayers();
        }
      });
    }

    this.positions = Positions;

    this.updatePosition = (player) => {
      if (player.position !== this.positions.bench) {
        this.team.players.filter(x => x !== player && x.position == player.position)
          .forEach(x => {
            x.position = this.positions.bench;
            x.DSSave();
          })
      }
      player.DSSave();
    }

    this.addPlayers = () => {
      for (let i = 1; i < 13; i++) {
        Players.create({ number: i, teamId: this.team.id })
      }
    }

    this.getPositions = () => {
      var type = this.isHome ? 'o' : 'd';
      var results = {};
      for (var key in Positions) {
        if (Positions.hasOwnProperty(key)) {
          if(Positions[key].type.indexOf(type) >= 0){
            results[key] = Positions[key];
          }
        }
      }
      return results;
    }
  }
})();