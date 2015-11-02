var $ = $; // get linter to shut up about '$'
var polysynth;
var key = 40; // default to key of C
var octave = -1; // default to low octave

// toggles
var invertMode = false;
var invertChord = false;
var specialChord = false;

var labels = (function() {
  var FLAT = '\u266D';
  var SHARP = '\u266F';
  var DIM = '\u00B0';
  var INV = '\u2076';

  var labels = [
    { number: 1, basic: 'I', invertMode: 'i', specialChord: 'I+' },
    { number: 2, basic: 'ii', invertMode: 'II', specialChord: 'ii' + DIM },
    { number: 3, basic: 'iii', invertMode: 'III', specialChord: 'VI' + FLAT },
    { number: 4, basic: 'IV', invertMode: 'iv', specialChord: 'iv' + SHARP + DIM },
    { number: 5, basic: 'V', invertMode: 'v', specialChord: 'v' + SHARP + DIM },
    { number: 6, basic: 'vi', invertMode: 'VI', specialChord: 'VII' + FLAT }
  ];

  return labels;
}());

var waveforms = ['sine', 'square', 'triangle', 'sawtooth'];

// ui handlers
var updateModifier = function updateModifier(modifier) {
  var INV = '\u2076';

  // get label for the button for a given chord number
  var getLabel = function getLabel(chordNumber) {
    var chordLabels = labels[chordNumber - 1];
    var label = '';

    switch (true) {
      case invertMode:
        label = chordLabels.invertMode;
        break;
      case specialChord:
        label = chordLabels.specialChord;
        break;
      default:
        label = chordLabels.basic;
    }

    if (invertChord) {
      label += INV; // add 6 as superscript
    }

    return label;
  };

  var modifiers = {
    Mm: function() {
      specialChord = false;
      $('#special').removeClass('on');
      invertMode = !invertMode;
    },
    x6: function() {
      invertChord = !invertChord;
    },
    special: function() {
      invertMode = false;
      $('#Mm').removeClass('on');
      specialChord = !specialChord;
    }
  };
  modifiers[modifier]();

  $('#' + modifier).toggleClass('on');

  // update chord labels
  labels.forEach(function(chord) {
    $('#chord' + chord.number).text(getLabel(chord.number));
  });

  // resize chord labels to fit inside buttons
  var newClass = (function getNewClass() {
    switch (true) {
      case !specialChord && !invertChord:
        return 'trenta';
      case invertChord && !specialChord:
        return 'venti';
      case specialChord && !invertChord:
        return 'grande';
      case specialChord && invertChord:
        return 'tall';
    }
  }());

  $('main').attr('class', newClass);
};

var toggleSettings = function() {
  $('#settingsPanel').toggleClass('hidden');
  $('#instrument').toggleClass('hidden');
};

var setVolume = function setVolume(newVolume) {
  polysynth.maxGain(newVolume);
  var volumeText = (newVolume * 100).toFixed(0);
  $('#volumeLabel').text(volumeText);
};

var setAttack = function setAttack(newAttack) {
  polysynth.attack(newAttack);
  var attackText = (newAttack * 1000).toFixed(0);
  $('#attackLabel').text(attackText);
};

var setDecay = function setDecay(newDecay) {
  polysynth.decay(newDecay);
  var decayText = (newDecay * 1000).toFixed(0);
  $('#decayLabel').text(decayText);
};

var setSustain = function setSustain(newSustain) {
  polysynth.sustain(newSustain);
  var sustainText = (newSustain * 1).toFixed(2);
  $('#sustainLabel').text(sustainText);
};

var setRelease = function setRelease(newRelease) {
  polysynth.release(newRelease);
  var releaseText = (newRelease * 1000).toFixed(0);
  $('#releaseLabel').text(releaseText);
};

var cutoff = {
  setMaxFrequency: function setMaxFrequency(newMaxFrequency) {
    polysynth.cutoff.maxFrequency(newMaxFrequency);
    var maxFrequencyText = newMaxFrequency;
    $('#cutoffMaxFrequencyLabel').text(maxFrequencyText);
  },
  setAttack: function setAttack(newAttack) {
    polysynth.cutoff.attack(newAttack);
    var attackText = (newAttack * 1000).toFixed(0);
    $('#cutoffAttackLabel').text(attackText);
  },
  setDecay: function setDecay(newDecay) {
    polysynth.cutoff.decay(newDecay);
    var decayText = (newDecay * 1000).toFixed(0);
    $('#cutoffDecayLabel').text(decayText);
  },
  setSustain: function setSustain(newSustain) {
    polysynth.cutoff.sustain(newSustain);
    var sustainText = (newSustain * 1).toFixed(2);
    $('#cutoffSustainLabel').text(sustainText);
  }
};

var setKey = function setKey(newKey) {
  console.log('newKey:', newKey);
  key = newKey;
  
  function getKeyLabel() {  
    var keys = [
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
    
    for (var i=0, ii=keys.length; i<ii; i++) {
      if (keys[i].value == key) {
        return keys[i].label;
      }
    }
  }
  
  var keyText = getKeyLabel();
  $('#keyLabel').text(keyText);
};

var setOctave = function setOctave(newOctave) {
  octave = newOctave;
  var octaveText = octave > 0 ? '+' + octave : octave;
  $('#octaveLabel').text(octaveText);
};

var setWidth = function setWidth(newWidth) {
  polysynth.width(newWidth);
  var widthText = (newWidth * 100).toFixed(0);
  $('#widthLabel').text(widthText);
};

var setWaveform = function setWaveform(newWaveform) {
  polysynth.waveform(newWaveform);
  waveforms.forEach(function(waveform) {
    $('#' + waveform + 'Button').removeClass('on');
  });
  $('#' + newWaveform + 'Button').addClass('on');
};

// initialize synth, controls and control panel
(function init() {
  var audioCtx;
  if (typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
  } else {
    audioCtx = new webkitAudioContext();
  }

  var synthCfg = {
    numVoices: 5,
    stereoWidth: 1,
    attack: 0.28,
    decay: 0,
    sustain: 1,
    release: 0.28,
    cutoff: {
      maxFrequency: 1800,
      attack: 0.1,
      decay: 2.5,
      sustain: 0.2
    }
  };
  
  polysynth = new Polysynth(audioCtx, synthCfg);

  // update controls to display initial synth values
  $('keySlider').val(key);
  $('#octaveSlider').val(octave);
  $('#widthSlider').val(polysynth.width());
  
  var voice = polysynth.voices[0];
  $('#volumeSlider').val(voice.maxGain);
  $('#attackSlider').val(voice.attack);
  $('#decaySlider').val(voice.decay);
  $('#sustainSlider').val(voice.sustain);
  $('#releaseSlider').val(voice.release);
  $('#cutoffFrequencySlider').val(voice.cutoff.maxFrequency);
  $('#cutoffAttackSlider').val(voice.cutoff.attack);
  $('#cutoffDecaySlider').val(voice.cutoff.decay);
  $('#cutoffSustainSlider').val(voice.cutoff.sustain);
  $('#waveformSelect').val(voice.waveform());

  // update labels to display initial synth values
  $('#settingsPanel input').trigger('input');
  $('#settingsPanel select').change();
  
  // prevent browser default behavior on touch/click of buttons
  $('button').on('touchstart mousedown', function(e) {
    e.preventDefault();
  });

  (function buildChordMenu() {
    var lastChord = 1; // track last-pressed chord button

    // determine chord to play and start playing it
    var start = function start(chordNumber) {

      var root = parseInt(key, 10); // set root based on selected key
      lastChord = chordNumber; // capture last-pressed chord number
      var chord = [];

      $('#chord' + chordNumber).addClass('on');

      var setChord = function setChord(root, quality) {
        quality = quality || 'major';

        chord[0] = root - 24;
        chord[1] = root - 12;
        chord[2] = root;

        var applyQuality = {
          major: function() {
            chord[3] = root + 4;
            chord[4] = root + 7;
          },
          minor: function() {
            chord[3] = root + 3;
            chord[4] = root + 7;
          },
          diminished: function() {
            chord[3] = root + 3;
            chord[4] = root + 6;
          },
          augmented: function() {
            chord[3] = root + 4;
            chord[4] = root + 8;
          }
        };

        applyQuality[quality]();
      };

      // shift all notes to first inversion
      var invert = function invert(chord) {
        chord[2] = chord[3];
        chord[3] = chord[4];
        chord[4] = chord[1] + 24;
        chord[0] = chord[2] - 24;
        chord[1] = chord[2] - 12;
      };

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
            setChord(root+4); // VI flat; weird, i know, but this chord is just more useful
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

      // trigger one note per oscillator
      polysynth.voices.forEach(function(voice, i) {
        // get the frequency in hertz of a given piano key
        var getFreq = function getFreq(pianoKey) {
          return Math.pow(2, (pianoKey-49)/12) * 440;
        };

        var pianoKey = chord[i] + (octave * 12);
        voice.pitch(getFreq(pianoKey));
      });

      // apply attack gain envelope
      polysynth.start();
    };

    // stop all oscillators if stop command came from last-pressed chord button
    var stop = function stop(chordNumber) {
      $('#chord' + chordNumber).removeClass('on');
      if (chordNumber === lastChord) {
        polysynth.stop();
      }
    };

    var isFirstInteraction = true; // for enabling iOS sound
    labels.forEach(function(chord) {
      var chordMenu = $('#chordMenu');

      var startChord = function startChord(e) {
        e.preventDefault();
        start(chord.number);
      };

      var stopChord = function stopChord(e) {
        e.preventDefault();
        if (isFirstInteraction) {
          isFirstInteraction = false;
          // let there be sound (on iOS)
          // create & play empty buffer
          var buffer = audioCtx.createBuffer(1, 1, 22050);
          var source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          if (source.noteOn) { // keep this from breaking in chrome
            source.noteOn(0);
          }
        }
        stop(chord.number);
      };

      $('<button/>', {
        id: 'chord' + chord.number,
        text: chord.basic,
        mousedown: startChord,
        mouseup: stopChord })
        .bind('touchstart', startChord)
        .bind('touchend', stopChord)
        .appendTo(chordMenu)
      ;
    });

    (function setUpKeyboardListeners() {
      var keyHandler = function keyHandler(event) {
        if (!event.repeat) { // ignore repeat keystrokes when holding down keys
          switch (event.keyCode) {
            case 16: // shift
            case 81: // Q
              updateModifier('Mm');
              break;
            case 17: // control
            case 65: // A
              updateModifier('x6');
              break;
            case 18: // alt
            case 90: // Z
              updateModifier('special');
              break;
            case 49: // 1
            case 87: // W
              event.type === 'keydown' ? start(1) : stop(1);
              break;
            case 50: // 2
            case 69: // E
              event.type === 'keydown' ? start(2) : stop(2);
              break;
            case 51: // 3
            case 82: // R
              event.type === 'keydown' ? start(3) : stop(3);
              break;
            case 52: // 4
            case 83: // S
              event.type === 'keydown' ? start(4) : stop(4);
              break;
            case 53: // 5
            case 68: // D
              event.type === 'keydown' ? start(5) : stop(5);
              break;
            case 54: // 6
            case 70: // F
              event.type === 'keydown' ? start(6) : stop(6);
              break;
          }
        }
      };

      document.addEventListener('keydown', keyHandler); 
      document.addEventListener('keyup', keyHandler);
    })();
  }());

  (function buildWaveformMenu() {
    var settingsButton = $('#waveformMenu .settings');
    var preventDefault = function preventDefault(e) {
      e.preventDefault();
    };
    
    waveforms.forEach(function(waveform) {
      var selectWaveform = function selectWaveform(e) {
        e.preventDefault();
        setWaveform(waveform);
      };

      $('<button/>', {
        id: waveform + 'Button',
        html: '&nbsp;',
        mousedown: preventDefault,
        click: selectWaveform
      })
        .bind('touchstart', preventDefault)
        .bind('touchend', selectWaveform)
        .insertBefore(settingsButton)
      ;
    });
    $('#sawtoothButton').click(); // default to sawtooth
  }());
}());
