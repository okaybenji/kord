/*!
 *  subpoly - a Web Audio subtractive polyphonic synthesizer
 *  (c) 2015 Benji Kay
 *  MIT License
 */

var Polysynth = function(audioCtx, config) {

  var synth = this;
  config = config || {};
  config.cutoff = config.cutoff || {};
  
  synth.audioCtx = audioCtx;
  synth.voices = [];

  // synth defaults
  var numVoices     = config.numVoices    || 16;
  synth.stereoWidth = config.stereoWidth  || 0.5; // out of 1

  for (var i = 0; i < numVoices; i++) {
    synth.voices.push(new Monosynth(audioCtx, config));
  }

  function init() {
    synth.width(synth.stereoWidth);
  }

  // initialize and export
  init();
  return synth;

};

// apply attack, decay, sustain envelope
Polysynth.prototype.start = function startSynth() {
  this.voices.forEach(function(voice) {
    voice.start();
  });
};

// apply release envelope
Polysynth.prototype.stop = function stopSynth() {
  this.voices.forEach(function(voice) {
    voice.stop();
  });
};

// get/set synth stereo width
Polysynth.prototype.width = function width(newWidth) {
  var synth = this;
  if (synth.voices && newWidth) {
    synth.stereoWidth = newWidth;
    synth.voices.forEach(function(voice, i) {
      var spread = 1/(synth.voices.length - 1);
      var xPos = spread * i * synth.stereoWidth;
      var zPos = 1 - Math.abs(xPos);
      voice.pan.setPosition(xPos, 0, zPos);
    });
  }

  return synth.stereoWidth;
};

// convenience methods for changing values of all Monosynths' properties at once
// TODO: call this so user doesn't have to
Polysynth.prototype.createSetters = function createSetters() {
  var synth = this;
  var monosynthProperties = ['maxGain', 'attack', 'decay', 'sustain', 'release'];
  var monosynthCutoffProperties = ['maxFrequency', 'attack', 'decay', 'sustain'];
  
  monosynthProperties.forEach(function(property) {
    Polysynth.prototype[property] = function(newValue) {
      synth.voices.forEach(function(voice) {
        voice[property] = newValue;
      });
    };
  });
  
  Polysynth.prototype.cutoff = {};
  monosynthCutoffProperties.forEach(function(property) {
    Polysynth.prototype.cutoff[property] = function(newValue) {
     synth.voices.forEach(function(voice) {
       voice.cutoff[property] = newValue;
     });
    };
  });
  
  Polysynth.prototype.waveform = function waveform(newWaveform) {
    synth.voices.forEach(function(voice) {
      voice.waveform(newWaveform);
    });
  };

  Polysynth.prototype.pitch = function pitch(newPitch) {
    synth.voices.forEach(function(voice) {
      voice.pitch(newPitch);
    });
  };
};
