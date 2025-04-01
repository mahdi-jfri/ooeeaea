"use client";

import {useEffect, useState} from "react";
import * as Tone from "tone";
import {emptyBuffer, stretchBuffer, concatBuffers} from "@/lib/tone";
import AudioCanvas from "@/components/AudioCanvas";
import {addBasePath} from "next/dist/client/add-base-path";

export default function Home() {
    const [catAudioBuffer, setCatAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);
    const [mineAudioBuffer, setMineAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);
    const [catProgress, setCatProgress] = useState<number | undefined>(undefined);
    const [mineProgress, setMineProgress] = useState<number | undefined>(undefined);

    useEffect(() => {
        const loadSound = async (url: string) => {
            return await Tone.ToneAudioBuffer.fromUrl(addBasePath(url));
        };

        const createCatAudioBuffer = async () => {
            const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all(["/co.wav", "/co_second.wav", "/ce_first.wav", "/ce_second.wav", "/ca.wav"].map(loadSound));
            const buffers = [
                await stretchBuffer(bufferCO),
                await stretchBuffer(bufferCEFirst),
                await stretchBuffer(bufferCEFirst),
                await stretchBuffer(bufferCA),
                await stretchBuffer(bufferCEFirst),
                await stretchBuffer(bufferCOSecond),
                emptyBuffer(0.1),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCESecond),
                await stretchBuffer(bufferCA),
                await stretchBuffer(bufferCESecond),
            ];
            return concatBuffers(buffers);
        };

        const createMineAudioBuffer = async () => {
            const [bufferO, bufferE, bufferA] = await Promise.all(["/o.wav", "/e.wav", "/a.wav"].map(loadSound));
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

        createCatAudioBuffer().then(setCatAudioBuffer);
        createMineAudioBuffer().then(setMineAudioBuffer);

        return;
    }, []);

    const setProgress = (player: Tone.Player, duration: number, startTime: number, setProgressCallback: CallableFunction) => {
        const _setProgress = () => {
            const playbackTime = player.state === "started" ? player.now() - startTime : 0;
            const progress = Math.min(1, playbackTime / duration);
            setProgressCallback(progress);
            if (player.state != "stopped")
                requestAnimationFrame(_setProgress);
        }
        requestAnimationFrame(_setProgress);
    };

    const playMineConsecutive = async () => {
        if (!mineAudioBuffer) return;

        const player = new Tone.Player(mineAudioBuffer).toDestination();
        const startTime = Tone.now();
        player.start(startTime);
        setProgress(player, mineAudioBuffer.duration, startTime, setMineProgress);
    };

    const playCatConsecutive = async () => {
        if (!catAudioBuffer) return;

        const player = new Tone.Player(catAudioBuffer).toDestination();
        const startTime = Tone.now();
        player.start(startTime);
        setProgress(player, catAudioBuffer.duration, startTime, setCatProgress);
    };

    return (
        <>
            <main
                className="flex flex-col w-full mx-auto p-5 gap-y-8 items-start sm:items-center font-[family-name:var(--font-geist-sans)]">
                <div className="max-w-full">
                    <div onClick={playCatConsecutive} className="text-left">CAT</div>
                    <AudioCanvas width={800} height={200} audioBuffer={catAudioBuffer} scroll={catProgress}></AudioCanvas>
                </div>
                <div className="max-w-full">
                    <div onClick={playMineConsecutive}>MINE</div>
                    <AudioCanvas width={800} height={200} audioBuffer={mineAudioBuffer} scroll={mineProgress}></AudioCanvas>
                </div>
            </main>
        </>
    );
}
