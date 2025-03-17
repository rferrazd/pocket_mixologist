import { FC, useEffect } from 'react'
import { StopCircleIcon } from 'lucide-react'
import { TooltipIconButton } from './tooltip-icon-button'
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer'
import AppleSpinner from '../ui/apple-spinner'

interface VoiceRecognitionProps {
  transcript: string
  onStop: () => void
  isRecording: boolean
  isLoading: boolean
}

export const VoiceRecognition: FC<VoiceRecognitionProps> = ({
  // transcript,
  onStop,
  isRecording,
  isLoading
}) => {
  const recorderControls = useVoiceVisualizer()

  useEffect(() => {
    if (isRecording) {
      recorderControls.startRecording()
    } else {
      recorderControls.stopRecording()
    }
  }, [isRecording, recorderControls])

  return (
    <div className="flex w-full items-center gap-4   h-[52px]">
      {/* Recording indicator with waveform */}
      <div className="flex items-center gap-2 h-[40px]">
        {isRecording && (
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </div>
        )}

        <VoiceVisualizer
          controls={recorderControls}
          height={80}
          width={580}
          mainBarColor="#ef4444" // red-500
          secondaryBarColor="#fca5a5" // red-300
          backgroundColor="transparent"
          barWidth={3}
          gap={1}
          rounded={5}
          isControlPanelShown={false}
          isDefaultUIShown={false}
          onlyRecording={true}
          isProgressIndicatorShown={false}
          isProgressIndicatorTimeShown={false}
          isAudioProcessingTextShown={false}
        />
      </div>

      {/* Transcript preview */}
      {/* <div className="flex-1 truncate text-sm">
        {transcript ? (
          <span className="text-muted-foreground">{transcript}</span>
        ) : (
          <span className="text-muted-foreground/60 italic">Speak now...</span>
        )}
      </div> */}
      {isLoading ? (
        <div className="h-[52px] flex items-center justify-center px-2">
          <div className="size-8 flex items-center justify-center rounded-md">
            <AppleSpinner />
          </div>
        </div>
      ) : (
        <TooltipIconButton
          tooltip="Stop recording"
          variant="default"
          className="my-2.5 size-6 p-2 transition-opacity ease-in bg-red-500 hover:bg-red-600"
          onClick={onStop}
        >
          <StopCircleIcon className="text-white" />
        </TooltipIconButton>
      )}
    </div>
  )
}
