import {TextField} from "@mui/material";
import AudioPlayer from "@/components/AudioPlayer";
import {useEffect, useRef, useState} from "react";
import * as Tone from "tone";
import {addBasePath} from "next/dist/client/add-base-path";
import {concatBuffers, emptyBuffer} from "@/lib/tone";

export default function CodeAudioPlayer() {
    const [textAudioBuffer, setTextAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const [codeValue, setCodeValue] = useState<string>("");

    const loadSound = async (url: string) => {
        return await Tone.ToneAudioBuffer.fromUrl(addBasePath(url));
    };

    const textRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!textRef.current) return;
        textRef.current.value = codeValue;
    }, [codeValue]);

    const changeCodeValue = async (codeValue: string) => {
        const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all(["/co.wav", "/co_second.wav", "/ce_first.wav", "/ce_second.wav", "/ca.wav"].map(loadSound));
        const buffers = [...codeValue].map((ch) => {
            if (ch === 'o') {
                return bufferCO;
            } else if (ch === 'O') {
                return bufferCOSecond;
            } else if (ch === 'e') {
                return bufferCEFirst;
            } else if (ch === 'E') {
                return bufferCESecond;
            } else if (ch === 'a') {
                return bufferCA;
            } else if (ch === ' ') {
                return emptyBuffer(0.05);
            }
        }).filter(e => e !== undefined);
        const buffer = await concatBuffers(buffers);

        setTextAudioBuffer(buffer);
        setCodeValue(codeValue);
    };

    return (
        <>
            <TextField
                multiline
                slotProps={{htmlInput: {ref: textRef}}}
                minRows={3}
                maxRows={6}
                variant="outlined"
                placeholder={'Write here'}
                onChange={(e) => {
                    e.preventDefault();
                    setCodeValue(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        changeCodeValue(codeValue);
                    }
                }}
                className="w-full border rounded-lg bg-foreground !mb-2"
            />
            <AudioPlayer width={800} height={200} audioBuffer={textAudioBuffer}></AudioPlayer>
        </>
    );
}