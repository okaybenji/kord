var kordApp = angular.module('kordApp', ['ngTouch']);

kordApp.controller('kordCtrl', ['$scope',
    
    function kordCtrl($scope) {
        
        //constants
        var FLAT = '\u266D';
        var SHARP = '\u266F';
        var DIM = '\u00B0';
        var INV = '\u2076';
        
        $scope.labels = [
            { number: 1, default: 'I', invertMode: 'i', specialChord: 'I+' },
            { number: 2, default: 'ii', invertMode: 'II', specialChord: 'ii' + DIM },
            { number: 3, default: 'iii', invertMode: 'III', specialChord: 'VI' + FLAT },
            { number: 4, default: 'IV', invertMode: 'iv', specialChord: 'iv' + SHARP + DIM },
            { number: 5, default: 'V', invertMode: 'v', specialChord: 'v' + SHARP + DIM },
            { number: 6, default: 'vi', invertMode: 'VI', specialChord: 'VII' + FLAT },
        ];
        
        var lastChord = 1; //track last-pressed chord button
        
        //toggles
        $scope.invertMode = false;
        $scope.invertChord = false;
        $scope.specialChord = false;
        
        //synth
        var polysynth = new Polysynth({numVoices: 5}); //create a synth with 5 voices -- two octaves of bass plus a triad
        $scope.synth = polysynth;
        
        $scope.keys = [
            { label: 'G', value: 35 },
            { label: 'G#', value: 36 },
            { label: 'A', value: 37 },
            { label: 'A#', value: 38 },
            { label: 'B', value: 39 },
            { label: 'C', value: 40 },
            { label: 'C#', value: 41 },
            { label: 'D', value: 42 },
            { label: 'D#', value: 43 },
            { label: 'E', value: 44 },
            { label: 'F', value: 45 },
            { label: 'F#', value: 46 }
        ];
        
        $scope.waveforms = ['sine','square','triangle','sawtooth'];
        $scope.octave = 0; //increment or decrement to change octave
        var chord = []; //array to hold notes to play
        
        $scope.$watch('synth.stereoWidth', $scope.synth.updateWidth); //watch for changes to stereo width value
        
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
        };
        
        $scope.key = $scope.keys[5]; //default to key of C
        $scope.showSettings = false; //default to instrument view
        $scope.selectedWaveform = '';
        
        //get the frequency in hertz of a given piano key
        function getFreq(key) {
            return Math.pow(2, (key-49)/12) * 440;
        }
        
        function setChord(root, quality) {
            
            chord[0] = root - 24;
            chord[1] = root - 12;
            chord[2] = root;
            
            switch (quality) {
                case 'diminished':
                    chord[3] = root + 3;
                    chord[4] = root + 6;
                    break;
                case 'minor':
                    chord[3] = root + 3;
                    chord[4] = root + 7;
                    break;
                case 'augmented':
                    chord[3] = root + 4;
                    chord[4] = root + 8;
                    break;
                default: //default to major
                    chord[3] = root + 4;
                    chord[4] = root + 7;
                    break;
            }
        }
        
        function invert(chord) {
            //shift all notes to first inversion
            chord[2] = chord[3];
            chord[3] = chord[4];
            chord[4] = chord[1] + 24;
            chord[0] = chord[2] - 24;
            chord[1] = chord[2] - 12;
        }
        
        //determine chord to play and start playing it
        $scope.start = function start(chordNumber) {
        
            var root = $scope.key.value;
            var invertMode = $scope.invertMode;
            var invertChord = $scope.invertChord;
            var specialChord = $scope.specialChord;
            
            lastChord = chordNumber; //capture last-pressed chord number
            
            switch(chordNumber) {
                case 1:
                    if (specialChord) {
                        setChord(root, 'augmented');
                    } else if (invertMode) {
                        setChord(root, 'minor');
                    } else {
                        setChord(root);
                    }
                    break;
                case 2:
                    root += 2;
                    if (specialChord) {
                        setChord(root, 'diminished');
                    } else if (!invertMode) {
                        setChord(root, 'minor');
                    } else {
                        setChord(root);
                    }
                    break;
                case 3:
                    root += 4;
                    if (specialChord) {
                        setChord(root+4); //VI flat; weird, i know, but this chord is just more useful
                    } else if (!invertMode) {
                        setChord(root, 'minor');
                    } else {
                        setChord(root);
                    }
                    break;
                case 4:
                    root += 5;
                    if (specialChord) {
                        root += 1;
                        setChord(root, 'diminished');
                    } else if (invertMode) {
                        setChord(root, 'minor');
                    } else {
                        setChord(root);
                    }
                    break;
                case 5:
                    root += 7;
                    if (specialChord) {
                        root += 1;
                        setChord(root, 'diminished');
                    } else if (invertMode) {
                        setChord(root, 'minor');
                    } else {
                        setChord(root);
                    }
                    break;
                case 6:
                    root += 9;
                    if (specialChord) {
                        root += 1;
                        setChord(root);
                    } else if (!invertMode) {
                        setChord(root, 'minor');
                    } else {
                        setChord(root);
                    }
                    break;
            }
            
            if (invertChord) {
                invert(chord);
            }
            
            //trigger one note per oscillator
            polysynth.voices.forEach(function(voice, i) {
                var key = chord[i] + ($scope.octave * 12);
                voice.pitch(getFreq(key));
            });
            
            //apply attack gain envelope
            polysynth.start();
        };
        
        //stop all oscillators if stop command came from last-pressed chord button
        $scope.stop = function stop(chordNumber) {
            if (chordNumber === lastChord) {
                polysynth.stop();
            }
        };
        
        $scope.setWaveform = function setWaveform(waveform) {
            polysynth.voices.forEach(function(voice) {
              voice.waveform(waveform);
            });
            $scope.selectedWaveform = waveform;
        };
        
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
        };
        
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
                case 49: //1
                case 87: //W
                    $scope.stop(1);
                    break;
                case 50: //2
                case 69: //E
                    $scope.stop(2);
                    break;
                case 51: //3
                case 82: //R
                    $scope.stop(3);
                    break;
                case 52: //4
                case 83: //S
                    $scope.stop(4);
                    break;
                case 53: //5
                case 68: //D
                    $scope.stop(5);
                    break;
                case 54: //6
                case 70: //F
                    $scope.stop(6);
                    break;
            }
        };

        //initialize polysynth
        var init = function init() {
            $scope.setWaveform($scope.waveforms[3]); //default to sawtooth wave
        };
        
        init();
    }
]);