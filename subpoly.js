/*!
 *  subpoly - a Web Audio subtractive polyphonic synthesizer
 *  (c) 2015 Benji Kay
 *  MIT License
 */

/*
 * TODO: Attach synth functions to its prototype.
 * TODO: Explore synth.cutoff.contour.
 * TODO: Consider making synth.stereoWidth a getter/setter function which contains updateWidth.
 */

var Polysynth = function(config) {

  var synth = this;
  config = config || {};
  config.cutoff = config.cutoff || {};
  synth.voices = [];
  
  var audioCtx = new AudioContext;
  var amp = audioCtx.createGain();
  var filter = audioCtx.createBiquadFilter();

  amp.gain.value = 0;
  filter.type = 'lowpass';
  filter.connect(amp);
  amp.connect(audioCtx.destination);

  //synth defaults
  var numVoices       = config.numVoices    || 16;
  var defaultWaveform = config.waveform     || 'sine';
  var defaultPitch    = config.pitch        || 440;
  
  synth.maxGain       = config.maxGain      || 0.9; //out of 1
  synth.attack        = config.attack       || 0.1; //in seconds
  synth.decay         = config.decay        || 0.0; //in seconds
  synth.sustain       = config.sustain      || 1.0; //out of 1
  synth.release       = config.release      || 0.8; //in seconds
  synth.stereoWidth   = config.stereoWidth  || 0.5; //out of 1
  
  //low-pass filter cutoff defaults
  synth.cutoff          = filter.frequency;
  synth.cutoff.value    = config.cutoff.value     || 7500; //in hertz
  synth.cutoff.maxValue = config.cutoff.maxValue  || 7500; //in hertz
  synth.cutoff.attack   = config.cutoff.attack    || 0.1; //in seconds
  synth.cutoff.decay    = config.cutoff.decay     || 2.5; //in seconds
  synth.cutoff.sustain  = config.cutoff.sustain   || 0.2; //out of 1
  
  function Voice() {
    //create and connect oscillator and stereo panner for voice
    this.osc = audioCtx.createOscillator();
    this.pan = audioCtx.createPanner();
    this.pan.panningModel = 'equalpower';
    this.osc.connect(this.pan);
    this.pan.connect(filter);
    this.osc.start(0);
    
    this.pitch(defaultPitch);
    this.waveform(defaultWaveform);
  }
  
  Voice.prototype.pitch = function pitch(newPitch) {
    if (newPitch) {
      var now = audioCtx.currentTime;
      this.osc.frequency.setValueAtTime(newPitch, now);
    }
    
    return this.osc.frequency.value;
  };
  
  Voice.prototype.waveform = function waveform(newWaveform) {
    if (newWaveform) {
      this.osc.type = newWaveform;
    }
    
    return this.osc.type;
  };

  for (var i = 0; i < numVoices; i++) {
    synth.voices.push(new Voice);
  }

  function getNow() {
    var now = audioCtx.currentTime;
    amp.gain.cancelScheduledValues(now);
    amp.gain.setValueAtTime(amp.gain.value, now);
    return now;
  }

  //update synth stereo width
  synth.updateWidth = function updateWidth() {
    synth.voices.forEach(function(voice, i) {
      var spread = 1/(synth.voices.length - 1);
      var xPos = spread * i * synth.stereoWidth;
      var zPos = 1 - Math.abs(xPos);
      voice.pan.setPosition(xPos, 0, zPos);
    });
  };

  //apply attack, decay, sustain envelope
  synth.start = function startSynth() {
    var atk = parseFloat(synth.attack);
    var dec = parseFloat(synth.decay);
    var now = getNow();
    applyCutoff(now);
    amp.gain.linearRampToValueAtTime(synth.maxGain, now + atk);
    amp.gain.linearRampToValueAtTime(synth.sustain * synth.maxGain, now + atk + dec);
  };

  //apply release envelope
  synth.stop = function stopSynth() {
    var rel = parseFloat(synth.release);
    var now = getNow();
    amp.gain.linearRampToValueAtTime(0, now + rel);
  };

  function applyCutoff(time) {
    var atk = parseFloat(synth.cutoff.attack);
    var dec = parseFloat(synth.cutoff.decay);
    synth.cutoff.cancelScheduledValues(time);
    synth.cutoff.linearRampToValueAtTime(synth.cutoff.value, time);
    synth.cutoff.linearRampToValueAtTime(synth.cutoff.maxValue, time + atk);
    synth.cutoff.linearRampToValueAtTime(synth.cutoff.sustain * synth.cutoff.maxValue, time + atk + dec);
  }

  function init() {
    synth.updateWidth();
  }

  //initialize and export
  init();
  return synth;

};
