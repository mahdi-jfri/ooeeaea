import {concatBuffers, emptyBuffer, stretchBuffer} from "@/lib/tone";
import {useEffect, useState} from "react";
import * as Tone from "tone";
import {addBasePath} from "next/dist/client/add-base-path";
import AudioPlayer from "@/components/AudioPlayer";

export default function MineAudioPlayer() {
    const [mineAudioBuffer, setMineAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const createMineAudioBuffer = async () => {
        const [bufferO, bufferE, bufferA] = await Promise.all([
            "/o.wav",
            "/e.wav",
            "/a.wav",
        ].map(
            async url => await Tone.ToneAudioBuffer.fromUrl(addBasePath(url))
        ));
        const buffers = [
            await stretchBuffer(bufferO, 2),
            emptyBuffer(0.08),
            await stretchBuffer(bufferE, 0.7),
            emptyBuffer(0.03),
            await stretchBuffer(bufferE, 0.7),
            await stretchBuffer(bufferA, 2),
            emptyBuffer(0.05),
            await stretchBuffer(bufferE, 0.7),
            await stretchBuffer(bufferO),

            emptyBuffer(0.1),

            await stretchBuffer(bufferE, 0.7),
            emptyBuffer(0.04),
            await stretchBuffer(bufferE, 0.7),
            emptyBuffer(0.04),
            await stretchBuffer(bufferE, 0.7),
            emptyBuffer(0.04),
            await stretchBuffer(bufferE, 0.7),
            await stretchBuffer(bufferA, 2),
            emptyBuffer(0.05),
            await stretchBuffer(bufferE, 0.7),
        ];

        return concatBuffers(buffers);
    };

    useEffect(() => {
        createMineAudioBuffer().then(setMineAudioBuffer);
    }, []);

    return (
        <AudioPlayer width={800} height={200} audioBuffer={mineAudioBuffer}></AudioPlayer>
    );
}