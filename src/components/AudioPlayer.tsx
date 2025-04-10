import * as Tone from "tone";
import AudioCanvas from "@/components/AudioCanvas";
import {useState} from "react";
import {Box, IconButton} from "@mui/material";
import {FastForwardRounded, FastRewindRounded, PlayArrowRounded, StopRounded} from "@mui/icons-material";

interface AudioPlayerProps {
    width: number;
    height: number;
    audioBuffer?: Tone.ToneAudioBuffer,
    bgColor?: string,
    lineColor?: string,
}

export default function AudioPlayer({width, height, audioBuffer, bgColor, lineColor}: AudioPlayerProps) {
    const [playProgress, setPlayProgress] = useState<number>(0);
    const [playing, setPlaying] = useState<boolean>(false);
    const [player, setPlayer] = useState<Tone.Player | undefined>(undefined);

    const playTimestamp = audioBuffer? playProgress * audioBuffer.duration : 0;

    const _setProgress = (player: Tone.Player, startTime: number) => {
        if (!audioBuffer) return;
        const playbackTime = player.state === "started" ? player.now() - startTime : 0;
        const progress = Math.min(1, playbackTime / audioBuffer.duration);
        setPlayProgress(progress);
        if (player.state != "stopped") {
            requestAnimationFrame(() => _setProgress(player, startTime));
        }
        else {
            setPlaying(false);
            setPlayer(undefined);
        }
    }

    const play = () => {
        if (!audioBuffer || playing) return;
        const player = new Tone.Player(audioBuffer).toDestination();
        const startTime = Tone.now();
        player.start(startTime);
        setPlaying(true);
        setPlayer(player);

        requestAnimationFrame(() => _setProgress(player, startTime));
    };

    const stopPlay = () => {
        player?.stop();
    };

    const setPosition = (value: number) => {
        if (!audioBuffer || !playing || !player) return;
        const startTime = Tone.now();
        player.restart(startTime, value);
        requestAnimationFrame(() => _setProgress(player, startTime - value));
    };

    function formatDuration(value: number) {
        const minute = Math.floor(value / 60);
        let secondLeft = Math.floor((value - minute * 60) * 10) / 10;
        if(audioBuffer && audioBuffer.duration >= 5)
            secondLeft = Math.floor(secondLeft);
        return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
    }

    const rewindTime = audioBuffer? Math.min(0.2 * audioBuffer.duration, 1) : 0;

    const fastRewind = () => {
        if (!audioBuffer || !playing || !player) return;
        setPosition(Math.max(0, playTimestamp - rewindTime));
    };

    const fastForward = () => {
        if (!audioBuffer || !playing || !player) return;
        setPosition(Math.min(audioBuffer.duration, playTimestamp + rewindTime));
    };

    return (
        <div>
            <AudioCanvas
                width={width}
                height={height}
                audioBuffer={audioBuffer}
                bgColor={bgColor}
                lineColor={lineColor}
                scroll={playProgress}
                onMovePosition={(position) => setPosition(position * (audioBuffer?.duration || 0))}
            />
            {audioBuffer && <Box className="flex items-center justify-between">
                <span className="text-xs opacity-50">{formatDuration(playProgress * audioBuffer.duration)}</span>
                <span className="text-xs opacity-50">{formatDuration(audioBuffer.duration * (1 - playProgress))}</span>
            </Box>}
            <Box
                className="flex items-center justify-center -mt-4"
            >
                <IconButton>
                    <FastRewindRounded fontSize="large" className="text-foreground !text-4xl" onClick={fastRewind} />
                </IconButton>
                <IconButton
                    onClick={() => (playing? stopPlay() : play())}
                >
                    {!playing ? (
                        <PlayArrowRounded className="text-foreground !text-4xl" />
                    ) : (
                        <StopRounded className="text-foreground !text-4xl" />
                    )}
                </IconButton>
                <IconButton>
                    <FastForwardRounded fontSize="large" className="text-foreground !text-4xl" onClick={fastForward}/>
                </IconButton>
            </Box>
        </div>
    );
};