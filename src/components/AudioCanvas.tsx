import {useCallback, useEffect, useRef} from "react";
import * as Tone from "tone";

interface AudioCanvasInput {
    width: number,
    height: number,
    audioBuffer?: Tone.ToneAudioBuffer,
    bgColor?: string,
    ratio?: number,
    scroll?: number,
    onMovePosition?: (position: number) => void,
}

export default function AudioCanvas({
                                        width,
                                        height,
                                        audioBuffer,
                                        ratio = 2,
                                        scroll = 0,
                                        onMovePosition,
                                    }: AudioCanvasInput) {
    const canvasParRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvasInnerWidth = Math.min(5000, Math.max(width, Math.floor(audioBuffer?.duration || 0) * 100));
    const canvasInnerHeight = height;

    useEffect(() => {
        if (!canvasParRef.current) return;
        canvasParRef.current.scrollLeft = canvasParRef.current.scrollWidth * Math.max(0, scroll - 0.1);
    }, [canvasParRef, scroll])

    const drawWaveform = useCallback(() => {
        if (!canvasRef.current || !audioBuffer) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        const w = canvas.width;
        const h = canvas.height;

        const data = audioBuffer.getChannelData(0) || [];
        const step = Math.ceil(data.length / w);
        const amp = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-foreground').trim();
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = ratio;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

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
    }, [canvasRef, audioBuffer, ratio, scroll]);

    const setRef = (ref: HTMLCanvasElement | null) => {
        if (ref) {
            canvasRef.current = ref;
            drawWaveform();
        }
    }

    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        if (onMovePosition)
            onMovePosition(position);
    };

    const setCanvasParRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            canvasParRef.current = ref;
            if (canvasParRef.current.scrollWidth > width)
                ref.style.width = width + "px";
        }
    }

    return (
        <div className="overflow-x-auto border rounded-lg max-w-full" ref={setCanvasParRef}>
            <canvas ref={setRef} width={canvasInnerWidth * ratio} height={canvasInnerHeight * ratio}
                    onClick={onClick}
                    style={{width: `${canvasInnerWidth}px`, height: `${canvasInnerHeight}px`}}
                    className="border-solid border-foreground"/>
        </div>
    )
};