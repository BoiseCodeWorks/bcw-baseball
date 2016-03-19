(function() {
  'use strict';

  angular
    .module('app')
    .controller('FieldController', FieldController);

  FieldController.$inject = ['Positions'];
  function FieldController(Positions) {
    this.getPlayerClass = (player) => {

    }
  }
})();



