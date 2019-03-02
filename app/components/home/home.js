'use strict';

angular.module('owsExplorerApp.controllers').controller('IndexController', function($rootScope, $scope, SocketService, Blocks) {
  var TRANSACTION_DISPLAYED = 10;
  var BLOCKS_DISPLAYED = 5;
  var socket;

  var _init = function() {
    socket = SocketService.getSocket($scope);
    if (!socket) return;

    if (!socket.isConnected()) {
      socket.on('connect', function() {
        _startSocket();
        _refresh();
      });
    } else {
      _startSocket();
      _refresh();
    }
  };

  var _refresh = function() {
    $scope.txs = [];
    $scope.blocks = [];
    _getBlocks();
  };

  $rootScope.$on('Local/SocketChange', function(event) {
    _init();
  });

  var _getBlocks = function() {
    Blocks.get({
      limit: BLOCKS_DISPLAYED
    }, function(res) {
      $scope.blocks = res.blocks;
      $scope.blocksLength = res.length;
    });
  };

  var _startSocket = function() { 
    socket.emit('subscribe', 'inv');

    socket.on('tx', function(tx) {
      $scope.txs.unshift(tx);
      if (parseInt($scope.txs.length, 10) >= parseInt(TRANSACTION_DISPLAYED, 10)) {
        $scope.txs = $scope.txs.splice(0, TRANSACTION_DISPLAYED);
      }
    });

    socket.on('block', function() {
      _getBlocks();
    });
  };

  $scope.closeFlashAlert = function() {
    $rootScope.flashMessage = null;
  };

  $scope.humanSince = function(time) {
    var m = moment.unix(time);
    return m.max().fromNow();
  };

  _init();

});
