/*!
 *  subpoly - a Web Audio subtractive polyphonic synthesizer
 *  (c) 2015 Benji Kay
 *  MIT License
 */

var Polysynth = function Polysynth(audioCtx, config) {

  var Synth = function Synth() {
    config = config || {};
    config.cutoff = config.cutoff || {};
    
    var synth = this;

    synth.audioCtx = audioCtx;
    synth.voices = [];

    for (var i = 0, ii = config.numVoices || 16; i < ii; i++) {
      synth.voices.push(new Monosynth(audioCtx, config));
    }

    synth.stereoWidth = config.stereoWidth  || 0.5; // out of 1
    synth.width(synth.stereoWidth);

    return synth;
  };

  // apply attack, decay, sustain envelope
  Synth.prototype.start = function startSynth() {
    this.voices.forEach(function(voice) {
      voice.start();
    });
  };

  // apply release envelope
  Synth.prototype.stop = function stopSynth() {
    this.voices.forEach(function(voice) {
      voice.stop();
    });
  };

  // get/set synth stereo width
  Synth.prototype.width = function width(newWidth) {
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
  (function createSetters() {
    var monosynthProperties = ['maxGain', 'attack', 'decay', 'sustain', 'release'];
    var monosynthCutoffProperties = ['maxFrequency', 'attack', 'decay', 'sustain'];

    monosynthProperties.forEach(function(property) {
      Synth.prototype[property] = function(newValue) {
        synth.voices.forEach(function(voice) {
          voice[property] = newValue;
        });
      };
    });

    Synth.prototype.cutoff = {};
    monosynthCutoffProperties.forEach(function(property) {
      Synth.prototype.cutoff[property] = function(newValue) {
       synth.voices.forEach(function(voice) {
         voice.cutoff[property] = newValue;
       });
      };
    });

    Synth.prototype.waveform = function waveform(newWaveform) {
      synth.voices.forEach(function(voice) {
        voice.waveform(newWaveform);
      });
    };

    Synth.prototype.pitch = function pitch(newPitch) {
      synth.voices.forEach(function(voice) {
        voice.pitch(newPitch);
      });
    };
  })();
  
  return new Synth;
};
