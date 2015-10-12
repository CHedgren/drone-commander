var context = new AudioContext();




var analyser = context.createAnalyser();

var osc1 = context.createOscillator();
var osc2 = context.createOscillator();

osc1.type = "triangle";
osc2.type = "triangle";



var lfo1 = context.createOscillator();
var lfo2 = context.createOscillator();

lfo1.type = "sawtooth";
lfo1.type = 4;
lfo2.type = "square";


osc1.start();
osc2.start();
lfo1.start();
lfo2.start();

var outamp = context.createGain();
var xfade1 = context.createGain();
var xfade2 = context.createGain();
var filter = context.createBiquadFilter();
var peakfilter = context.createBiquadFilter();


peakfilter.type = "peak";
filter.type = "bandpass";
filter.frequency.value = 40;

osc1.connect(xfade1);
osc2.connect(xfade2);

xfade2.connect(filter);
xfade1.connect(filter);


lfo1.connect(filter.frequency);

var lfo2gain = context.createGain();
var lfo1gain = context.createGain();
lfo1gain.gain.value = 1;
lfo2.connect(lfo2gain);

lfo1gain.connect(filter.frequency);
lfo2gain.connect(filter.Q);

lfo1.connect(lfo1gain);


filter.connect(peakfilter);
peakfilter.connect(outamp);
outamp.connect(context.destination);
outamp.connect(analyser);


var osc1knob =    document.getElementById('controlosc1');
var mixknob =     document.getElementById('controlmix');
var osc2knob =    document.getElementById('controlosc2');
var pulseknob =   document.getElementById('controlpulse');
var filterknob =  document.getElementById('controlfilter');
var numbersknob = document.getElementById('control2-4-8-16');
var volknob =     document.getElementById('vol');


var bufferSize = 4096;
var effect = (function() {
    var node = context.createScriptProcessor(bufferSize, 1, 1);
    node.bits = 4; // between 1 and 16
    node.normfreq = 0.1; // between 0.0 and 1.0
    var step = Math.pow(1/2, node.bits);
    var phaser = 0;
    var last = 0;
    node.onaudioprocess = function(e) {
        var input = e.inputBuffer.getChannelData(0);
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            phaser += node.normfreq;
            if (phaser >= 1.0) {
                phaser -= 1.0;
                last = step * Math.floor(input[i] / step + 0.5);
            }
            output[i] = last;
        }
    };
    return node;
})();


osc1.frequency.value = osc1knob.value;
xfade1.gain.value = mixknob.value/100;
xfade2.gain.value = mixknob.value/100;
osc2.frequency.value = osc2knob.value;
lfo2gain.gain.value = pulseknob.value/100;
osc2.frequency.value = osc2knob.value;
outamp.gain.value = volknob.value/100;





osc1knob.addEventListener("input", slide);
mixknob.addEventListener("input", slide);
osc2knob.addEventListener("input", slide);
pulseknob.addEventListener("input", slide);
numbersknob.addEventListener("input", slide);
osc2.addEventListener("input", slide);
osc2.addEventListener("input", slide);
volknob.addEventListener("input", slide);
filterknob.addEventListener("input", slide);

function crossfade(val) {
    var x = parseInt(val) / 100;
    // Use an equal-power crossfading curve:
    var gain1 = Math.cos(x * 0.5*Math.PI);
    var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
    xfade1.gain.value = gain1;
    xfade2.gain.value = gain2;
    console.log(gain1 + "    " + gain2);
};


function slide() {
    // console.log(this);
    // console.log(this.getAttribute("id"));
    console.log(this.getAttribute("id"));
    if (this.getAttribute("id") == 'controlosc1') {

        osc1.frequency.value = this.value;
        console.log("osc1: ", osc1.frequency.value);
    }

    else if (this.getAttribute("id") == 'controlmix') {
        crossfade(val);

    }

    else if (this.getAttribute("id") == 'controlosc2') {
        osc2.frequency.value = this.value;
    }

    else if (this.getAttribute("id") == 'controllfo') {
        lfo1.frequency.value = this.value;
        console.log(lfo1.frequency.value);
    }

    else if (this.getAttribute("id") == 'controlshape') {

    }

    else if (this.getAttribute("id") == 'controlpulse') {
        lfo2gain.gain.value = this.value/100;
        console.log(lfo2gain.gain.value);
    }

    else if (this.getAttribute("id") == 'controlfilter') {
        console.log("filter");
        filter.frequency.value = this.value;
        peakfilter.frequency.value = this.value;
    }

    else if (this.getAttribute("id") == 'control2-4-8-16') {
        lfo2.frequency.value = lfo1.frequency.value*this.value;
        console.log(lfo2.frequency.value +"  " +this.value+ " ");
    }
    else if (this.getAttribute("id") == 'vol') {


        outamp.gain.value = this.value/100;
        console.log(outamp.gain.value);
    }
}


















function shapecoefficients(t, a) {
    var bn = new Float32Array(4096);
    var an = new Float32Array(4096);


    for ( n = 0 ; n < 50; n++) {
        b = 2 * Math.PI * n / t;
        bn[i] = -((Math.sin(b * (t - a)) + b * (a - t + 1) * Math.cos(b * (t - a)) - Math.sin(b * t) + b * (t - 1) * Math.cos(b * t)) / (a * b * b));


        an[i] = (b *( ((a - t + 1) * Math.sin(b * (t - a)) + (t - 1) * Math.sin(b * t))) - Math.cos(b * (t - a)) + Math.cos(b * t)) / (b * b * a);

        console.log("b " + b + "        sin " + Math.sin(b*(t-a)) +  "         b*(t-a)" + (b*(t-a)));
    }
    return [an, bn];
}



analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.smoothingTimeConstant = 1;
analyser.getByteTimeDomainData(dataArray);
analyser.maxDecibels =500;



// draw an oscilloscope of the current audio source
var canvas = document.getElementById('drone-control');
var canvasCtx = canvas.getContext('2d');

function draw() {

    drawVisual = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = canvas.width * 1.0 / (bufferLength);
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / (128.0);
        var y = v * canvas.height/2 ;

        if(i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
};

draw();
