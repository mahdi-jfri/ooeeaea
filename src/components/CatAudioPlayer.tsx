import {concatBuffers, emptyBuffer} from "@/lib/tone";
import {useEffect, useState} from "react";
import * as Tone from "tone";
import {addBasePath} from "next/dist/client/add-base-path";
import AudioPlayer from "@/components/AudioPlayer";

export default function CatAudioPlayer() {
    const [catAudioBuffer, setCatAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const createCatAudioBuffer = async () => {
        const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all([
            "/co.wav",
            "/co_second.wav",
            "/ce_first.wav",
            "/ce_second.wav",
            "/ca.wav",
        ].map(
            async url => await Tone.ToneAudioBuffer.fromUrl(addBasePath(url))
        ));
        const buffers = [
            bufferCO,
            bufferCEFirst,
            bufferCEFirst,
            bufferCA,
            bufferCEFirst,
            bufferCOSecond,
            emptyBuffer(0.1),
            bufferCESecond,
            bufferCESecond,
            bufferCESecond,
            bufferCESecond,
            bufferCA,
            bufferCESecond,
        ];
        return concatBuffers(buffers);
    };

    useEffect(() => {
        createCatAudioBuffer().then(setCatAudioBuffer);
    }, []);

    return (
        <AudioPlayer width={800} height={200} audioBuffer={catAudioBuffer}></AudioPlayer>
    );
}