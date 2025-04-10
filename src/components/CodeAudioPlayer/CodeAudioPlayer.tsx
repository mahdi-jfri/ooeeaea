import {Box, TextField} from "@mui/material";
import AudioPlayer from "@/components/AudioPlayer";
import {useCallback, useEffect, useRef, useState} from "react";
import * as Tone from "tone";
import {addBasePath} from "next/dist/client/add-base-path";
import {concatBuffers, emptyBuffer} from "@/lib/tone";

export default function CodeAudioPlayer() {
    const [textAudioBuffer, setTextAudioBuffer] = useState<Tone.ToneAudioBuffer | undefined>(undefined);

    const [codeValue, setCodeValue] = useState<string>("");

    const textRef = useRef<HTMLInputElement | null>(null);

    const keepAllowed = (code: string): string => {
        return [...code].filter((ch) => ['o', 'O', 'e', 'E', 'a', ' ', '\n'].includes(ch)).join('');
    };

    const compile = useCallback(async () => {
        if (!codeValue) {
            setTextAudioBuffer(undefined);
            return;
        }
        const [bufferCO, bufferCOSecond, bufferCEFirst, bufferCESecond, bufferCA] = await Promise.all([
            "/co.wav",
            "/co_second.wav",
            "/ce_first.wav",
            "/ce_second.wav",
            "/ca.wav",
        ].map(async (url) => await Tone.ToneAudioBuffer.fromUrl(addBasePath(url))));
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
            } else if (ch === ' ' || ch == '\n') {
                return emptyBuffer(0.1);
            }
        }).filter(e => e !== undefined);
        const buffer = await concatBuffers(buffers);

        setTextAudioBuffer(buffer);
    }, [codeValue]);

    useEffect(() => {
        if(textRef.current) {
            const startingValue = "oeeaeO EEEEaE"
            setCodeValue(startingValue);
            textRef.current.value = startingValue;
            compile();
        }
    }, [textRef, codeValue, compile]);

    useEffect(() => {
        const timeoutId = setTimeout(compile, 500);
        return () => clearTimeout(timeoutId);
    }, [codeValue, compile]);

    return (
        <>
            <Box className="flex flex-row flex-wrap justify-between gap-x-2 gap-y-2 mb-4">
                <TextField
                    multiline
                    slotProps={{
                        htmlInput: {
                            ref: textRef,
                        }
                    }}
                    minRows={3}
                    maxRows={6}
                    variant="outlined"
                    placeholder={'Write here'}
                    onChange={(e) => {
                        e.preventDefault();
                        const value = keepAllowed(e.target.value);
                        if(textRef.current) textRef.current.value = value;
                        setCodeValue(value);
                    }}
                    helperText="Use o, e, a, O, E, and space."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            compile();
                        }
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                                border: "none",
                            },
                            "&.Mui-focused fieldset": {
                                border: "none",
                            },
                            "&:hover fieldset": {
                                border: "none",
                            },
                        },
                    }}
                    className="w-full rounded-lg bg-foreground"
                />
            </Box>
            <AudioPlayer width={800} height={200} audioBuffer={textAudioBuffer}></AudioPlayer>
        </>
    );
}