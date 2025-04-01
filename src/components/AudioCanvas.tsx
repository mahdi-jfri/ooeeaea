import {useCallback, useEffect, useRef} from "react";
import * as Tone from "tone";

interface AudioCanvasInput {
    width: number,
    height: number,
    audioBuffer?: Tone.ToneAudioBuffer,
    bgColor?: string,
    lineColor?: string,
    ratio?: number,
    scroll?: number,
};

export default function AudioCanvas({
                                        width,
                                        height,
                                        audioBuffer,
                                        bgColor = "#ffffff",
                                        lineColor = "#0055ae",
                                        ratio = 4,
                                        scroll = 0,
                                    }: AudioCanvasInput) {
    const canvasParRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawWaveform = useCallback(() => {
        if (!canvasParRef.current || !canvasRef.current || !audioBuffer) return;
        canvasParRef.current.scrollLeft = canvasParRef.current.scrollWidth * Math.max(0, scroll - 0.1);

        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        const w = canvas.width;
        const h = canvas.height;

        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / w);
        const amp = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = ratio;
        ctx.strokeStyle = lineColor;

        ctx.beginPath();
        for (let i = 0; i < w; i++) {
            const min = Math.min(...data.slice(i * step, (i + 1) * step));
            const max = Math.max(...data.slice(i * step, (i + 1) * step));

            ctx.moveTo(i, amp + min * amp);
            ctx.lineTo(i, amp + max * amp);
        }
        ctx.moveTo(0, amp);
        for (let i = 1; i < w; i++) {
            ctx.lineTo(i, amp);
            ctx.moveTo(i, amp);
        }
        const scrollPosition = w * scroll;
        ctx.moveTo(scrollPosition, 0);
        ctx.lineTo(scrollPosition, h);
        ctx.closePath();
        ctx.stroke();
    }, [canvasRef, audioBuffer, bgColor, lineColor, ratio, scroll]);

    useEffect(() => {
        drawWaveform();
    }, [drawWaveform]);

    const setRef = (ref: HTMLCanvasElement | null) => {
        if (ref) {
            canvasRef.current = ref;
            ref.style.width = width + "px";
            ref.style.height = height + "px";
            drawWaveform();
        }
    }

    return (
        <div className="overflow-x-auto border max-w-full" ref={canvasParRef}>
            <canvas ref={setRef} width={width * ratio} height={height * ratio}
                    className="border-solid border-foreground"/>
        </div>
    )
};