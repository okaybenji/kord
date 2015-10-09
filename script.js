var polysynth;
var octave = 0;
var chord = [];
var waveforms = ['sine','square','triangle','sawtooth'];

// initialize synth and control panel
function init() {
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
