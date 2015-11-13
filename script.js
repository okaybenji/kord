var $ = $; // get linter to shut up about '$'
var polysynth;
var settings;

// toggles
var invertMode = false;
var invertChord = false;
var specialChord = false;

var labels = (function() {
  var FLAT = '<span class="accidental">\u266D</span>';
  var SHARP = '<span class="accidental">\u266F</span>';
  var DIM = '\u00B0';
  var AUG = '+';

  var labels = [
    { number: 1, basic: 'I', invertMode: 'i', specialChord: 'I' + AUG },
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
var updateModifier = function updateModifier(modifier, on) {
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

  var modifiers;
  if (typeof on === 'undefined') {
    $('#' + modifier).toggleClass('on');
    modifiers = {
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
  } else if (on === true) {
    modifiers = {
      Mm: function() {
        specialChord = false;
        invertMode = true;
      },
      x6: function() {
        invertChord = true;
      },
      special: function() {
        invertMode = false;
        specialChord = true;
      }
    };
    $('#' + modifier).addClass('on');
  } else {
    modifiers = {
      Mm: function() {
        invertMode = false;
        if ($('#special').hasClass('on')) {
          updateModifier('special', true);
        }
      },
      x6: function() {
        invertChord = false;
      },
      special: function() {
        specialChord = false;
        if ($('#Mm').hasClass('on')) {
          updateModifier('Mm', true);
        }
      }
    };
    $('#' + modifier).removeClass('on');
  }
  modifiers[modifier]();

  // update chord labels
  labels.forEach(function(chord) {
    $('#chord' + chord.number).html(getLabel(chord.number));
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
  $('.settings').toggleClass('on');
};

var saveSettings = function saveSettings(newSettings) {
  // TODO: since this is called on input, debounce to limit number of times we access storage
  var settings = JSON.parse(localStorage.getItem('settings'));
  Object.assign(settings, newSettings);
  localStorage.setItem('settings', JSON.stringify(settings));
};

var setVolume = function setVolume(newVolume) {
  newVolume = Number(newVolume);
  // adjust gain for human logarithmic hearing
  var gain = Math.pow(newVolume, 2);
  // adjust gain for perceived loudness of different waveforms
  var waveform = polysynth.voices[0].waveform();
  switch (waveform) {
    case 'square':
      gain *= 0.65;
      break;
    case 'sawtooth':
      gain *= 0.85;
      break;
    case 'sine':
      gain *= 0.95;
      break;
    case 'triangle':
    default:
      gain *= 1;
      break;
  }
  
  polysynth.maxGain(gain);
  var volumeText = (newVolume * 100).toFixed(0);
  $('#volumeLabel').text(volumeText);
  saveSettings({volume: newVolume});
};

var setAttack = function setAttack(newAttack) {
  newAttack = Number(newAttack);
  polysynth.attack(newAttack);
  var attackText = (newAttack * 1000).toFixed(0);
  $('#attackLabel').text(attackText);
  saveSettings({attack: newAttack});
};

var setDecay = function setDecay(newDecay) {
  newDecay = Number(newDecay);
  polysynth.decay(newDecay);
  var decayText = (newDecay * 1000).toFixed(0);
  $('#decayLabel').text(decayText);
  saveSettings({decay: newDecay});
};

var setSustain = function setSustain(newSustain) {
  newSustain = Number(newSustain);
  var adjustedSustain = Math.pow(newSustain, 2);
  polysynth.sustain(adjustedSustain);
  var sustainText = (newSustain * 1).toFixed(2);
  $('#sustainLabel').text(sustainText);
  saveSettings({sustain: newSustain});
};

var setRelease = function setRelease(newRelease) {
  newRelease = Number(newRelease);
  polysynth.release(newRelease);
  var releaseText = (newRelease * 1000).toFixed(0);
  $('#releaseLabel').text(releaseText);
  saveSettings({release: newRelease});
};

var cutoff = {
  setMaxFrequency: function setMaxFrequency(newMaxFrequency) {
    newMaxFrequency = Number(newMaxFrequency);
    polysynth.cutoff.maxFrequency(newMaxFrequency);
    var maxFrequencyText = newMaxFrequency;
    $('#cutoffMaxFrequencyLabel').text(maxFrequencyText);
    saveSettings({cutoff: {maxFrequency: newMaxFrequency}});
  },
  setAttack: function setAttack(newAttack) {
    newAttack = Number(newAttack);
    polysynth.cutoff.attack(newAttack);
    var attackText = (newAttack * 1000).toFixed(0);
    $('#cutoffAttackLabel').text(attackText);
    saveSettings({cutoff: {attack: newAttack}});
  },
  setDecay: function setDecay(newDecay) {
    newDecay = Number(newDecay);
    polysynth.cutoff.decay(newDecay);
    var decayText = (newDecay * 1000).toFixed(0);
    $('#cutoffDecayLabel').text(decayText);
    saveSettings({cutoff: {decay: newDecay}});
  },
  setSustain: function setSustain(newSustain) {
    newSustain = Number(newSustain);
    polysynth.cutoff.sustain(newSustain);
    var sustainText = (newSustain * 1).toFixed(2);
    $('#cutoffSustainLabel').text(sustainText);
    saveSettings({cutoff: {sustain: newSustain}});
  }
};

var setKey = function setKey(newKey) {
  settings.key = newKey = Number(newKey);
  
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
      if (keys[i].value === newKey) {
        return keys[i].label;
      }
    }
  }
  
  var keyText = getKeyLabel();
  $('#keyLabel').text(keyText);
  saveSettings({key: newKey});
};

var setOctave = function setOctave(newOctave) {
  settings.octave = newOctave = Number(newOctave);
  var octaveText = newOctave > 0 ? '+' + newOctave : newOctave;
  $('#octaveLabel').text(octaveText);
  saveSettings({octave: newOctave});
};

var setWidth = function setWidth(newWidth) {
  newWidth = Number(newWidth);
  polysynth.width(newWidth);
  var widthText = (newWidth * 100).toFixed(0);
  $('#widthLabel').text(widthText);
  saveSettings({stereoWidth: newWidth});
};

var setWaveform = function setWaveform(newWaveform) {
  polysynth.waveform(newWaveform);
  setVolume($('#volumeSlider').val()); // adjust for perceived loudness of waveform
  waveforms.forEach(function(waveform) {
    $('#' + waveform + 'Button').removeClass('on');
  });
  $('#' + newWaveform + 'Button').addClass('on');
  saveSettings({waveform: newWaveform});
};

var panic = function panic() {
  window.location = window.location; // reload page w/o POST
};

// initialize synth, controls and control panel
(function init() {
  var audioCtx;
  if (typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
  } else {
    audioCtx = new webkitAudioContext();
  }

  var getSettings = function getSettings() {
    var settings = JSON.parse(localStorage.getItem('settings'));
    // var settings = null; // debugging
    if (!settings) {
      // load and save defaults
      settings = {
        key: 40, // C
        octave: -1,
        waveform: 'sawtooth',
        volume: 0.9,
        numVoices: 5,
        stereoWidth: 1,
        attack: 0.28,
        decay: 0.28,
        sustain: 1,
        release: 0.28,
        cutoff: {
          maxFrequency: 1800,
          attack: 0.1,
          decay: 2.5,
          sustain: 0.2
        }
      };
      localStorage.setItem('settings', JSON.stringify(settings));
    }
    return settings;
  };
  
  settings = getSettings();
  polysynth = new Polysynth(audioCtx, settings);

  // update controls to display initial synth values
  $('#keySlider').val(settings.key); // not a subpoly or submono property
  $('#octaveSlider').val(settings.octave); // not a subpoly or submono property
  $('#widthSlider').val(polysynth.width());
  
  var voice = polysynth.voices[0];
  $('#volumeSlider').val(settings.volume); // volume != gain
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

      var root = settings.key; // set root based on selected key
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

        var pianoKey = chord[i] + (settings.octave * 12);
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
        polysynth.lfo.depth(0); // reset lfo depth
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
      
      // set lfo depth based on touch pressure
      var updateLfo = function updateLfo(e) {
        e.preventDefault();
        var touches = e.touches || e.originalEvent.touches || e.originalEvent.changedTouches;
        if (!touches) {
          return;
        }
        var touchForce = touches[0].force || 0;
        polysynth.lfo.depth(touchForce);
      };

      $('<button/>', {
        id: 'chord' + chord.number,
        text: chord.basic,
        mousedown: startChord,
        mouseup: stopChord })
        .bind('touchstart', startChord)
        .bind('touchend', stopChord)
        .bind('touchmove', updateLfo)
        .appendTo(chordMenu)
      ;
    });

    (function setUpKeyboardListeners() {
      var keyHandler = function keyHandler(event) {
        if (!event.repeat) { // ignore repeat keystrokes when holding down keys
          switch (event.keyCode) {
            case 16: // shift
            case 81: // Q
              switch (event.type) {
                case 'keydown':
                  updateModifier('Mm', true);
                  break;
                case 'keyup':
                  updateModifier('Mm', false);
                  break;
              }
              break;
            case 17: // control
            case 65: // A
              switch (event.type) {
                case 'keydown':
                  updateModifier('x6', true);
                  break;
                case 'keyup':
                  updateModifier('x6', false);
                  break;
              }
              break;
            case 18: // alt
            case 90: // Z
              switch (event.type) {
                case 'keydown':
                  updateModifier('special', true);
                  break;
                case 'keyup':
                  updateModifier('special', false);
                  break;
              }
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
    $('#' + settings.waveform + 'Button').click();
  }());
}());
