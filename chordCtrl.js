var chordOrganApp = angular.module('chordOrganApp', []);

chordOrganApp.controller('chordCtrl', ['$scope',
    
    function tileCtrl($scope) {

//        var Tile = function(color) {
//            this.color = color || 'none';
//        };
        
//        Tile.prototype = {
//            
//            flip: function flip() {
//                //if tile is flipped one way, flip it back the other way
//                this.transform = (this.transform == 'rotateY(180deg)') ? 'rotateY(0deg)' : 'rotateY(180deg)';
//            }
//            
//        };
        
        //get the frequency in hertz of a given piano key
        function getFreq(key) {
            return Math.pow(2, (key-49)/12) * 440;
        }
        
        $scope.start = function start() {
            startTone(getFreq(52));
            startTone(getFreq(56));
            startTone(getFreq(59));
        }
        
        $scope.stop = function stop() {
            stopTone();
        }

        var init = function init() {
            //do initial stuff
        }
        
        init();
    }
]);