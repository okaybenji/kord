var polysynth;
var octave = 0;
var chord = [];
var lastChord = 1; // track last-pressed chord button

// toggles
var invertMode = false;
var invertChord = false;
var specialChord = false;


var FLAT = '\u266D';
var SHARP = '\u266F';
var DIM = '\u00B0';
var INV = '\u2076';

var labels = [
  { number: 1, default: 'I', invertMode: 'i', specialChord: 'I+' },
  { number: 2, default: 'ii', invertMode: 'II', specialChord: 'ii' + DIM },
  { number: 3, default: 'iii', invertMode: 'III', specialChord: 'VI' + FLAT },
  { number: 4, default: 'IV', invertMode: 'iv', specialChord: 'iv' + SHARP + DIM },
  { number: 5, default: 'V', invertMode: 'v', specialChord: 'v' + SHARP + DIM },
  { number: 6, default: 'vi', invertMode: 'VI', specialChord: 'VII' + FLAT },
];

var waveforms = ['sine','square','triangle','sawtooth'];

// initialize synth and control panel
var init = function init() {
  var audioCtx;
  if (typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
  } else {
    audioCtx = new webkitAudioContext();
  }

  polysynth = new Polysynth(audioCtx, { numVoices: 5} );
  
  // update controls to display initial synth values
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
  $('#settingsPanel input').change();
  $('#settingsPanel select').change();
  
  (function buildChordMenu() {
    var chordMenu = $('#chordMenu');
    labels.forEach(function(chord) {
      $('<button/>', {
        id: 'chord' + chord.number,
        text: chord.default,
        mousedown: function() {
          start(chord.number)
        },
        mouseup: function() {
          stop(chord.number)
        },
      }).appendTo(chordMenu);
    });
  })();
  
  (function buildKeyMenu() {
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
    
    var keyMenu = $('#keyMenu');
    keys.forEach(function(key) {
      keyMenu.append(new Option(key.label, key.value));
    });
    
    keyMenu.val(40); // default to key of C
  })();
  
  (function buildWaveformMenu() {
    var waveformMenu = $('#waveformMenu');
    waveforms.forEach(function(waveform) {
      $('<button/>', {
        id: waveform + 'Button',
        click: function() {
          setWaveform(waveform)
        }
      }).appendTo(waveformMenu);
    });
    $('#sawtoothButton').click(); // default to sawtooth
  })();
}

// get the frequency in hertz of a given piano key
var getFreq = function getFreq(key) {
  return Math.pow(2, (key-49)/12) * 440;
}

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
          label = chordLabels.default;
  }

  if (invertChord) {
      label += INV; // add 6 as superscript
  }

  return(label);
};

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
}

// shift all notes to first inversion
var invert = function invert(chord) {
  chord[2] = chord[3];
  chord[3] = chord[4];
  chord[4] = chord[1] + 24;
  chord[0] = chord[2] - 24;
  chord[1] = chord[2] - 12;
}

// determine chord to play and start playing it
start = function start(chordNumber) {
  var root = parseInt($('#keyMenu').val(), 10);
  lastChord = chordNumber; // capture last-pressed chord number

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
      var key = chord[i] + (octave * 12);
      voice.pitch(getFreq(key));
    });

    // apply attack gain envelope
    polysynth.start();
};

// stop all oscillators if stop command came from last-pressed chord button
stop = function stop(chordNumber) {
  if (chordNumber === lastChord) {
    polysynth.stop();
  }
};


// ui handlers
var setVolume = function setVolume(newVolume) {
  polysynth.maxGain(newVolume);
  var volumeText = (newVolume * 100).toFixed(0) + '%';
  $('#volumeLabel').text(volumeText);
}

var setAttack = function setAttack(newAttack) {
  polysynth.attack(newAttack);
  var attackText = newAttack * 1000 + 'ms';
  $('#attackLabel').text(attackText);
}

var setDecay = function setDecay(newDecay) {
  polysynth.decay(newDecay);
  var decayText = newDecay * 1000 + 'ms';
  $('#decayLabel').text(decayText);
}

var setSustain = function setSustain(newSustain) {
  polysynth.sustain(newSustain);
  var sustainText = (newSustain * 1).toFixed(2) + 'x';
  $('#sustainLabel').text(sustainText);
}

var setRelease = function setRelease(newRelease) {
  polysynth.release(newRelease);
  var releaseText = newRelease * 1000 + 'ms';
  $('#releaseLabel').text(releaseText);
}

var cutoff = {
  setMaxFrequency: function setMaxFrequency(newMaxFrequency) {
    polysynth.cutoff.maxFrequency(newMaxFrequency);
    var maxFrequencyText = newMaxFrequency + 'hz';
    $('#cutoffMaxFrequencyLabel').text(maxFrequencyText);
  },
  setAttack: function setAttack(newAttack) {
    polysynth.cutoff.attack(newAttack);
    var attackText = newAttack * 1000 + 'ms';
    $('#cutoffAttackLabel').text(attackText);
  },
  setDecay: function setDecay(newDecay) {
    polysynth.cutoff.decay(newDecay);
    var decayText = newDecay + 'ms';
    $('#cutoffDecayLabel').text(decayText);
  },
  setSustain: function setSustain(newSustain) {
    polysynth.cutoff.sustain(newSustain);
    var sustainText = (newSustain * 1).toFixed(2) + 'x';
    $('#cutoffSustainLabel').text(sustainText);
  }
};

var setWidth = function setWidth(newWidth) {
  polysynth.width(newWidth);
  var widthText = (newWidth * 100).toFixed(0) + '%';
  $('#widthLabel').text(widthText);
};

var setWaveform = function setWaveform(newWaveform) {
  polysynth.waveform(newWaveform);
  waveforms.forEach(function(waveform) {
    $('#' + waveform + 'Button').removeClass('on');
  });
  $('#' + newWaveform + 'Button').addClass('on');
};

init();
