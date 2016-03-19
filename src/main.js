(function() {
  'use strict';

  angular.module('app', ['resources'])
    .constant('Positions', (function() {
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
        onDeck: { type: "o", name: "On Deck", className: "on-deck" },
      }
    })())
})();
