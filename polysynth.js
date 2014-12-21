var Polysynth = function(numVoices) {

    var audioCtx = new webkitAudioContext;
    var oscs = []; //oscillator array
    var amp = audioCtx.createGain();

    var synth = this;
    
    synth.maxGain = .9; //default volume (out of 1)
    synth.attack = .1; //default attack (in seconds)
    synth.decay = 0; //default decay (in seconds)
    synth.sustain = 1; //default sustain (out of 1)
    synth.release = .8 //default release (in seconds)
    synth.filter = audioCtx.createBiquadFilter();
    synth.filter.type = 'lowpass';
    synth.filter.frequency.value = 20000 //default low-pass filter cutoff (in hertz)
    
    synth.filter.connect(amp);
    amp.connect(audioCtx.destination);
    amp.gain.value = 0;
    
    //populate osc array
    for (var i=0; i<numVoices; i++) {
        oscs[i] = audioCtx.createOscillator();
        oscs[i].connect(synth.filter);
        oscs[i].start(0);
    }
    
    function getNow() {
        var now = audioCtx.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        return now;
    }
    
    //change waveform (default: sine)
    synth.setWaveform = function setWaveform(waveform) {
        for (var i=0; i<numVoices; i++) {
            oscs[i].type = waveform;
        }
    }

    //set note pitch for given oscillator
    synth.setPitch = function setPitch(i, frequency) {
        var now = audioCtx.currentTime;
        oscs[i].frequency.setValueAtTime(frequency, now);
    };
    
    //apply attack, decay, sustain envelope
    synth.start = function start() {
        var atk = parseFloat(synth.attack);
        var dec = parseFloat(synth.decay);
        var now = getNow();
        amp.gain.linearRampToValueAtTime(synth.maxGain, now + atk);
        amp.gain.linearRampToValueAtTime(synth.sustain * synth.maxGain, now + atk + dec);
    }
    
    //apply release envelope
    synth.stop = function stop() {
        var rel = parseFloat(synth.release);
        var now = getNow();
        amp.gain.linearRampToValueAtTime(0, now + rel);
    };

    //export
    return synth;

};