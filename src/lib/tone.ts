import * as Tone from "tone";

const playbackRateToPitchShift = (playbackRate: number) => -12 * Math.log2(playbackRate);


export const emptyBuffer = (duration: number, sampleRate?: number, channels: number = 2): Tone.ToneAudioBuffer => {
    sampleRate = sampleRate || Tone.getContext().sampleRate;
    return new Tone.ToneAudioBuffer().set(Tone.getContext().createBuffer(channels, sampleRate * duration, sampleRate));
}

export const stretchBuffer = async (buffer: Tone.ToneAudioBuffer, stretch: number = 1) => {
    const newDuration = buffer.duration * stretch;
    return Tone.Offline(({transport}) => {
        const playbackRate = buffer.duration / newDuration;

        const pitchShiftValue = playbackRateToPitchShift(playbackRate);

        const pitchShift = new Tone.PitchShift({
            pitch: pitchShiftValue
        }).toDestination();

        const player = new Tone.Player(buffer).connect(pitchShift);
        player.playbackRate = playbackRate;

        player.start();
        transport.start();
    }, newDuration);
};

export const concatBuffers = (buffers: Tone.ToneAudioBuffer[]) => {
    let sumDuration = 0;
    for (const buffer of buffers) {
        sumDuration += buffer.duration;
    }

    return Tone.Offline(({transport}) => {
        let currentTime = 0;
        for (const buffer of buffers) {
            const player = new Tone.Player(buffer).toDestination();
            player.start(currentTime);
            currentTime += buffer.duration;
        }
        transport.start();
    }, sumDuration);
};
