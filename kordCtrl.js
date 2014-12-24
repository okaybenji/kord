var kordApp = angular.module('kordApp', []);

kordApp.controller('kordCtrl', ['$scope',
    
    function kordCtrl($scope) {
        
        //constants
        var FLAT = '\u266D';
        var SHARP = '\u266F';
        var DIM = '\u00B0';
        var INV = '\u2076';
        
        //C major
        var defaultChord = [];
        defaultChord[0] = 16; //C1
        defaultChord[1] = 28; //C2
        defaultChord[2] = 40; //C3
        defaultChord[3] = 44; //E3
        defaultChord[4] = 47; //G3
        
        $scope.labels = [
            { number: 1, default: 'I', invertMode: 'i', specialChord: 'I+' },
            { number: 2, default: 'ii', invertMode: 'II', specialChord: 'ii' + DIM },
            { number: 3, default: 'iii', invertMode: 'III', specialChord: 'iii' + DIM },
            { number: 4, default: 'IV', invertMode: 'iv', specialChord: 'iv' + SHARP + DIM },
            { number: 5, default: 'V', invertMode: 'v', specialChord: 'v' + SHARP + DIM },
            { number: 6, default: 'vi', invertMode: 'VI', specialChord: 'VII' + FLAT },
        ];
        
        //toggles
        $scope.invertMode = false;
        $scope.invertChord = false;
        $scope.specialChord = false;
        
        //synth
        var polysynth = new Polysynth(defaultChord.length);
        $scope.synth = polysynth;
        
        $scope.keys = [
            { label: 'G', value: -5 },
            { label: 'G#', value: -4 },
            { label: 'A', value: -3 },
            { label: 'A#', value: -2 },
            { label: 'B', value: -1 },
            { label: 'C', value: 0 },
            { label: 'C#', value: 1 },
            { label: 'D', value: 2 },
            { label: 'D#', value: 3 },
            { label: 'E', value: 4 },
            { label: 'F', value: 5 },
            { label: 'F#', value: 6 }
        ];
        
        $scope.waveforms = ['sine','square','triangle','sawtooth'];
        $scope.octave = 0; //increment or decrement to change octave
        
        //watch for changes to stereo width value
        $scope.$watch('synth.stereoWidth', $scope.synth.updateWidth);
        
        $scope.label = function getLabel(chordNumber) {
            
            var chordLabels = $scope.labels[chordNumber - 1];
            var label = '';
            
            switch (true) {
                case $scope.invertMode:
                    label = chordLabels.invertMode;
                    break;
                case $scope.specialChord:
                    label = chordLabels.specialChord;
                    break;
                default:
                    label = chordLabels.default;
            }
            
            if ($scope.invertChord) {
                label += INV; //add 6 as superscript
            }
            
            return(label);
        }
        
        $scope.keyShift = $scope.keys[5]; //default to key of C
        $scope.showSettings = false; //default to instrument view
        $scope.selectedWaveform = '';
        
        //get the frequency in hertz of a given piano key
        function getFreq(key) {
            return Math.pow(2, (key-49)/12) * 440;
        }
        
        function minor(chord) {
            //lower third
            chord[3] = chord[3] - 1;
        }
        
        function augment(chord) {
            //raise fifth
            chord[4] = chord[4] + 1;
        }
        
        function diminish(chord) {
            //lower third and fifth
            chord[3] = chord[3] - 1;
            chord[4] = chord[4] - 1;
        }
        
        function invert(chord) {
            //shift all notes to first inversion
            chord[2] = chord[3];
            chord[3] = chord[4];
            chord[4] = chord[1] + 24;
            chord[0] = chord[2] - 24;
            chord[1] = chord[2] - 12;
        }
        
        //shift all notes up (or down)
        function shift(chord, halfSteps) {
            for (var i=0, ii=chord.length; i<ii; i++) {
                chord[i]+=halfSteps;
            }
        }
        
        //determine chord to play and start playing it
        $scope.start = function start(chordNumber) {
            
            var chord = defaultChord.slice(); //build from default (C major) chord (slice copies by val rather than ref)
            var invertMode = $scope.invertMode;
            var invertChord = $scope.invertChord;
            var specialChord = $scope.specialChord;
            
            switch(chordNumber) {
                case 1:
                    if (specialChord) {
                        augment(chord);
                    } else if (invertMode) {
                        minor(chord);
                    }
                    break;
                case 2:
                    if (specialChord) {
                        diminish(chord);
                    } else if (!invertMode) {
                        minor(chord);
                    }
                    shift(chord, 2);
                    break;
                case 3:
                    if (specialChord) {
                        diminish(chord);
                    } else if (!invertMode) {
                        minor(chord);
                    }
                    shift(chord, 4);
                    break;
                case 4:
                    if (specialChord) {
                        diminish(chord);
                        shift(chord, 1);
                    } else if (invertMode) {
                        minor(chord);
                    }
                    shift(chord, 5);
                    break;
                case 5:
                    if (specialChord) {
                        diminish(chord);
                        shift(chord, 1);
                    } else if (invertMode) {
                        minor(chord);
                    }
                    shift(chord, 7);
                    break;
                case 6:
                    if (specialChord) {
                        shift(chord, 1);
                    } else if (!invertMode) {
                        minor(chord);
                    }
                    shift(chord, 9);
                    break;
            }
            
            if (invertChord) {
                invert(chord);
            }
            
            //trigger one note per oscillator
            for (var i=0, ii=chord.length; i<ii; i++) {
                var key = chord[i] + $scope.keyShift.value + ($scope.octave * 12);
                polysynth.setPitch(i, getFreq(key));
            }
            
            //apply attack gain envelope
            polysynth.start();
        }
        
        //stop all oscillators
        $scope.stop = function () {
            polysynth.stop();
        }
        
        $scope.setWaveform = function setWaveform(waveform) {
            polysynth.setWaveform(waveform);
            $scope.selectedWaveform = waveform;
        }
        
        //allow playing instrument with computer keyboard
        $scope.handleKeydown = function($event) {
            
            if (!$event.repeat) { //ignore repeat keystrokes when holding down keys
                switch ($event.keyCode) {
                    case 16: //shift
                    case 81: //Q
                        $scope.specialChord = false;
                        $scope.invertMode = true;
                        break;
                    case 17: //control
                    case 65: //A
                        $scope.invertChord = true;
                        break;
                    case 18: //alt
                    case 90: //Z
                        $scope.invertMode = false;
                        $scope.specialChord = true;
                        break;
                    case 49: //1
                    case 87: //W
                        $scope.start(1);
                        break;
                    case 50: //2
                    case 69: //E
                        $scope.start(2);
                        break;
                    case 51: //3
                    case 82: //R
                        $scope.start(3);
                        break;
                    case 52: //4
                    case 83: //S
                        $scope.start(4);
                        break;
                    case 53: //5
                    case 68: //D
                        $scope.start(5);
                        break;
                    case 54: //6
                    case 70: //F
                        $scope.start(6);
                        break;
                }
            }
        }
        
        $scope.handleKeyup = function($event) {
            
            switch ($event.keyCode) {
                case 81: //Q
                case 16: //shift
                    $scope.invertMode = false;
                    break;
                case 17: //control
                case 65: //A
                    $scope.invertChord = false;
                    break;
                case 18: //alt
                case 90: //Z
                    $scope.specialChord = false;
                    break;
                default: //any other key
                    $scope.stop();
                    break;
            }
        }

        //initialize polysynth
        var init = function init() {
            $scope.setWaveform($scope.waveforms[3]); //default to sawtooth wave
        }
        
        init();
    }
]);