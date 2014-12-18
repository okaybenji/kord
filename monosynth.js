var monosynth = function() {

    var audioCtx = new webkitAudioContext;
    var oscillator, amp;
    var maxGain = .9; //out of 1
    var fadeInLength = .1; //in seconds
    var fadeOutLength = 1 //in seconds
    
    oscillator = audioCtx.createOscillator();
    amp = audioCtx.createGain();
    oscillator.type = 'sine';
    amp.connect(audioCtx.destination);
    oscillator.connect(amp);
    amp.gain.value = 0;
    oscillator.start(0);

    //constructor
    var Voice = function () {
    };

    //play a note
    Voice.start = function start(frequency) { 
        var now = audioCtx.currentTime;
        oscillator.frequency.setValueAtTime(frequency, now);
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(maxGain, audioCtx.currentTime + fadeInLength);    
    };
    
    //stop the note
    Voice.stop = function stop() {
        var now = audioCtx.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeOutLength);
    };
    
    Voice.setWaveform = function setWaveform(waveform) {
        oscillator.type = waveform;
    }

    //export synth
    return Voice;

};