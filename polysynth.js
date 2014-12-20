var Polysynth = function(numVoices) {

    var audioCtx = new webkitAudioContext;
    var oscs = []; //oscillator array
    var amp = audioCtx.createGain();
    amp.connect(audioCtx.destination);
    amp.gain.value = 0;
    
    var synth = this;
    synth.maxGain = .9; //default volume (out of 1)
    synth.attack = .1; //default attack (in seconds)
    synth.decay = 0; //default decay (in seconds)
    synth.sustain = 1; //default sustain (out of 1)
    synth.release = 1 //default release (in seconds)
    
    //populate osc array
    for (var i=0; i<numVoices; i++) {
        oscs[i] = audioCtx.createOscillator();
        oscs[i].connect(amp);
        oscs[i].start(0);
    }
    
    //apply gain envelope
    function applyEnvelope(length, gain, delay) {
        length = parseFloat(length);
        delay = delay || 0;
        var now = audioCtx.currentTime;
        if (!delay) {
            amp.gain.cancelScheduledValues(now);
        }
        setTimeout(function() {
            amp.gain.setValueAtTime(amp.gain.value, now);
            amp.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + length)}, delay * 1000);
        return length; //return for setting delay
    };
    
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
        var delay = applyEnvelope(synth.attack, synth.maxGain); //apply attack and capture delay for decay
        applyEnvelope(synth.decay, synth.sustain * synth.maxGain, delay); //apply decay after delay
    }
    
    //apply release envelope
    synth.stop = function stop() {
        applyEnvelope(synth.release, 0);
    };

    //export
    return synth;

};