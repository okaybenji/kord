var Polysynth = function(numVoices) {

    var audioCtx = new webkitAudioContext;
    var oscs = []; //oscillator array
    var amp = audioCtx.createGain();
    amp.connect(audioCtx.destination);
    amp.gain.value = 0;
    
    var synth = this;
    synth.maxGain = .9; //default volume (out of 1)
    synth.attack = .1; //default attack (in seconds)
    synth.release = 1 //default release (in seconds)
    
    //populate osc array
    for (var i=0; i<numVoices; i++) {
        oscs[i] = audioCtx.createOscillator();
        oscs[i].connect(amp);
        oscs[i].start(0);
    }
    
    //apply gain envelope
    function applyEnvelope(env, gain) {
        if(env===synth.attack){
            console.log('attack',env)
        } else if(env===synth.release){
            console.log('release',env)
        } else {
            console.log('attack/release ' + synth.attack + ' ' + synth.release);
        };
        var now = audioCtx.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + parseFloat(env));
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
    
    //apply attack envelope
    synth.start = function start() {
        applyEnvelope(synth.attack, synth.maxGain);
    }
    
    //apply release envelope
    synth.stop = function stop() {
        applyEnvelope(synth.release, 0);
    };

    //export
    return synth;

};