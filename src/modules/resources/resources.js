(() => {
  'use strict';
  var baseUrl = window.location.hostname === "localhost" ? "http://localhost:63801" : "http://api.boisecodeworks.com/";
  angular
    .module('resources', ['js-data'])
    .config((DSHttpAdapterProvider, DSFirebaseAdapterProvider) => {
      DSHttpAdapterProvider.defaults.basePath = baseUrl + "/api";
      DSFirebaseAdapterProvider.defaults.basePath = 'https://bcw-bcc.firebaseio.com/';
    }).run((DS, DSHttpAdapter, DSFirebaseAdapter, Uow) => {
      // the firebase adapter was already registered
      DS.adapters.firebase === DSFirebaseAdapter;
      // but we want to make it the default
      DS.registerAdapter('firebase', DSFirebaseAdapter, { default: false });

      // Activate a mostly auto-sync with Firebase
      // The only thing missing is auto-sync TO Firebase
      // This will be easier with js-data 2.x, but right
      // now you still have to do DS.update('user', 1, { foo: 'bar' }), etc.
      angular.forEach(DS.definitions, function(Resource) {
        var ref = DSFirebaseAdapter.ref.child(Resource.endpoint);
        // Inject items into the store when they're added to Firebase
        // Update items in the store when they're modified in Firebase
        ref.on('child_changed', function(dataSnapshot) {
          var data = dataSnapshot.val();
          if (data[Resource.idAttribute]) {
            Resource.inject(data);
          }
        });
        // Eject items from the store when they're removed from Firebase
        ref.on('child_removed', function(dataSnapshot) {
          var data = dataSnapshot.val();
          if (data[Resource.idAttribute]) {
            Resource.eject(data[Resource.idAttribute]);
          }
        });
      });
    }).factory('Uow', (Games, Teams, Players) => {
      return {
        Games: Games,
        Teams: Teams,
        Players: Players
      }
    }).factory('Games', (DS) => {
      return DS.defineResource({
        name: 'game',
        endpoint: 'games',
        computed: {
          players: {
            get: () => {
              return [].concat(this.homeTeam.players).concat(this.awayTeam.players);
            }
          }
        },
        relations: {
          hasOne: {
            team: [
              {
                localKey: 'awayTeamId',
                localField: 'awayTeam'
              }, {
                localKey: 'homeTeamId',
                localField: 'homeTeam'
              }
            ]
          }
        }
      });
    }).factory('Teams', (DS) => {
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
        },

      });
    }).factory('Players', (DS) => {
      var store = DS.defineResource({
        name: 'player',
        endpoint: 'players',
        relations: {
          belongsTo: {
            team: {
              localKey: 'teamId',
              localField: 'team',
              //parent: true
            }
          }
        },
        saveAll: () => {
          store.getAll().filter(x => x.DSHasChanges()).forEach(x => x.DSSave());
        }
      });

      return store;
    })
})();