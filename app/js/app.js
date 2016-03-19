'use strict';

(function () {
  'use strict';

  angular.module('app', ['resources']).constant('Positions', function () {
    return {
      bench: { type: "od", name: "-Bench-", className: "pos-pine" },
      pitcher: { type: "d", name: "Pitcher", className: "pos-pitcher" },
      catcher: { type: "d", name: "Catcher", className: "pos-catcher" },
      first: { type: "d", name: "1st", className: "pos-first" },
      second: { type: "d", name: "2nd", className: "pos-second" },
      third: { type: "d", name: "3rd", className: "pos-third" },
      short: { type: "d", name: "Short", className: "pos-short" },
      left: { type: "d", name: "Left", className: "pos-left" },
      center: { type: "d", name: "Center", className: "pos-center" },
      right: { type: "d", name: "Right", className: "pos-right" },
      atFirst: { type: "o", name: "On 1st", className: "at-first" },
      atSecond: { type: "o", name: "On 2nd", className: "at-second" },
      atThird: { type: "o", name: "On 3rd", className: "at-third" },
      atHome: { type: "o", name: "At Home", className: "at-home" },
      atBatLeft: { type: "o", name: "Bat Left", className: "box-left" },
      atBatRight: { type: "o", name: "Bat Right", className: "box-right" },
      onDeck: { type: "o", name: "On Deck", className: "on-deck" }
    };
  }());
})();
'use strict';

(function () {
  'use strict';

  angular.module('app').controller('FieldController', FieldController);

  FieldController.$inject = ['Positions'];
  function FieldController(Positions) {
    this.getPlayerClass = function (player) {};
  }
})();
'use strict';

(function () {
  'use strict';

  GameController.$inject = ["Positions", "Games", "Teams", "Players"];
  angular.module('app').controller('GameController', GameController);

  function GameController(Positions, Games, Teams, Players) {
    var _this = this;

    //Lets just work with the one game we have
    var gameId = 1;
    Games.find(gameId).then(function (data) {
      _this.game = data;
      console.dir(data);
    });

    Teams.findAll().then(function (data) {
      _this.teams = data;
      console.dir(data);
    });

    Players.findAll().then(function (data) {
      _this.players = data;
      console.dir(data);
    });

    this.loadBases = function () {
      var hp = _this.game.homeTeam.players;
      var ap = _this.game.awayTeam.players;
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
    };

    this.saveAll = function () {

      Games.getAll().forEach(function (x) {
        return x.DSSave();
      });
      Teams.getAll().forEach(function (x) {
        return x.DSSave();
      });
      Players.getAll().forEach(function (x) {
        return x.DSSave().catch(function (d) {
          console.dir(d);
          debugger;
        });
      });
    };

    this.getPlayerClass = function (player) {
      var homeClass = player.team === _this.game.homeTeam ? 'team-home' : 'team-away';

      //home team always at bat....
      var posClass = '';
      if (player.position && Positions[player.position]) {
        posClass = Positions[player.position].className;
      } else {
        posClass = Positions.bench.className;
      }

      return [homeClass, posClass];
    };
  }
})();
"use strict";

(function () {
  'use strict';

  var baseUrl = window.location.hostname === "localhost" ? "http://localhost:63801" : "http://api.boisecodeworks.com/";
  angular.module('resources', ['js-data']).config(["DSHttpAdapterProvider", "DSFirebaseAdapterProvider", function (DSHttpAdapterProvider, DSFirebaseAdapterProvider) {
    DSHttpAdapterProvider.defaults.basePath = baseUrl + "/api";
    DSFirebaseAdapterProvider.defaults.basePath = 'https://bcw-bcc.firebaseio.com/';
  }]).run(["DS", "DSHttpAdapter", "DSFirebaseAdapter", "Uow", function (DS, DSHttpAdapter, DSFirebaseAdapter, Uow) {
    // the firebase adapter was already registered
    DS.adapters.firebase === DSFirebaseAdapter;
    // but we want to make it the default
    DS.registerAdapter('firebase', DSFirebaseAdapter, { default: false });

    // Activate a mostly auto-sync with Firebase
    // The only thing missing is auto-sync TO Firebase
    // This will be easier with js-data 2.x, but right
    // now you still have to do DS.update('user', 1, { foo: 'bar' }), etc.
    angular.forEach(DS.definitions, function (Resource) {
      var ref = DSFirebaseAdapter.ref.child(Resource.endpoint);
      // Inject items into the store when they're added to Firebase
      // Update items in the store when they're modified in Firebase
      ref.on('child_changed', function (dataSnapshot) {
        var data = dataSnapshot.val();
        if (data[Resource.idAttribute]) {
          Resource.inject(data);
        }
      });
      // Eject items from the store when they're removed from Firebase
      ref.on('child_removed', function (dataSnapshot) {
        var data = dataSnapshot.val();
        if (data[Resource.idAttribute]) {
          Resource.eject(data[Resource.idAttribute]);
        }
      });
    });
  }]).factory('Uow', ["Games", "Teams", "Players", function (Games, Teams, Players) {
    return {
      Games: Games,
      Teams: Teams,
      Players: Players
    };
  }]).factory('Games', ["DS", function (DS) {
    return DS.defineResource({
      name: 'game',
      endpoint: 'games',
      computed: {
        players: {
          get: function get() {
            return [].concat(undefined.homeTeam.players).concat(undefined.awayTeam.players);
          }
        }
      },
      relations: {
        hasOne: {
          team: [{
            localKey: 'awayTeamId',
            localField: 'awayTeam'
          }, {
            localKey: 'homeTeamId',
            localField: 'homeTeam'
          }]
        }
      }
    });
  }]).factory('Teams', ["DS", function (DS) {
    return DS.defineResource({
      name: 'team',
      endpoint: 'teams',
      relations: {
        hasMany: {
          player: {
            foreignKey: 'teamId',
            localField: 'players'
          }
        }
      }

    });
  }]).factory('Players', ["DS", function (DS) {
    var store = DS.defineResource({
      name: 'player',
      endpoint: 'players',
      relations: {
        belongsTo: {
          team: {
            localKey: 'teamId',
            localField: 'team'
          }
        }
      },
      //parent: true
      saveAll: function saveAll() {
        store.getAll().filter(function (x) {
          return x.DSHasChanges();
        }).forEach(function (x) {
          return x.DSSave();
        });
      }
    });

    return store;
  }]);
})();
'use strict';

(function () {
  'use strict';

  RosterController.$inject = ["Positions", "Players"];
  angular.module('app').directive('roster', Roster);

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
    var _this = this;

    //see if we have the players array and if it is empty
    if (this.team && this.team.players && this.team.players.length == 0) {
      //load the players for the team.
      this.team.DSLoadRelations('player').then(function (data) {
        //if no players found. Create them.
        if (data && data.length == 0) {
          _this.addPlayers();
        }
      });
    }

    this.positions = Positions;

    this.updatePosition = function (player) {
      if (player.position !== _this.positions.bench) {
        _this.team.players.filter(function (x) {
          return x !== player && x.position == player.position;
        }).forEach(function (x) {
          x.position = _this.positions.bench;
          x.DSSave();
        });
      }
      player.DSSave();
    };

    this.addPlayers = function () {
      for (var i = 1; i < 13; i++) {
        Players.create({ number: i, teamId: _this.team.id });
      }
    };

    this.getPositions = function () {
      var type = _this.isHome ? 'o' : 'd';
      var results = {};
      for (var key in Positions) {
        if (Positions.hasOwnProperty(key)) {
          if (Positions[key].type.indexOf(type) >= 0) {
            results[key] = Positions[key];
          }
        }
      }
      return results;
    };
  }
})();