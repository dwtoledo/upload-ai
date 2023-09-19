import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { Separator } from './components/ui/separator'
import { Textarea } from './components/ui/textarea'
import { VideoInputForm } from './components/video-input-form'
import { AIInputForm } from './components/ai-input-form'
import { FormEvent, useState } from 'react'
import { INITIAL_AI_TEMPERATURE } from './components/ai-temperature-slide'
import { UserAlert } from './components/user-alert'
import { useCompletion } from 'ai/react'

let userAlertTitle: string
let userAlertMessage: string
let userAlertActionText: string

export function App() {
  const [temperature, setTemperature] = useState(INITIAL_AI_TEMPERATURE)
  const [openUserAlert, setOpenUserAlert] = useState<boolean>(false)
  const [videoId, setVideoId] = useState<string | null>(null)

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/result',
    body: {
      videoId,
      temperature,
    },
    headers: {
      'Content-type': 'application/json',
    },
    onError: handleError,
  })

  function handleError(error: Error) {
    handleOpenUserAlert(
      'Generation error!',
      `Please contact the system administrator: ${error.message}`,
      'Ok',
    )
  }

  function handleUserAlertClose() {
    setOpenUserAlert(false)
  }

  function handleAITemperatureChange(value: number) {
    setTemperature(value)
  }

  function handleOpenUserAlert(
    title: string,
    message: string,
    actionText: string,
  ) {
    userAlertTitle = title
    userAlertMessage = message
    userAlertActionText = actionText
    setOpenUserAlert(true)
  }

  function handleOnFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!videoId) {
      handleOpenUserAlert(
        'Attention!',
        'Please upload a video before generate a result',
        'Ok',
      )
      return
    }

    if (!input) {
      handleOpenUserAlert(
        'Attention!',
        'Please select a prompt before generate a result',
        'Ok',
      )
      return
    }

    handleSubmit(event)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Ai.VideoTools by @dwtoledo</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Use the AI to transcript a video and generate YouTube titles and
            descriptions
          </span>

          <Separator orientation="vertical" className="h-6" />
          <a href="http://github.com/dwtoledo" target="_blank" rel="noreferrer">
            <Button variant="outline">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </a>
        </div>
      </header>
      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              placeholder="Insert the prompt for the AI..."
              className="resize-none p-4 leading-relaxed"
              value={input}
              onChange={handleInputChange}
            ></Textarea>
            <Textarea
              placeholder="Result generated by AI..."
              className="resize-none p-4 leading-relaxed"
              readOnly
              value={completion}
            ></Textarea>
          </div>
          <p className="text-sm text-muted-foreground">
            Remember: You can use the variable{' '}
            <code className="text-violet-400">{'{transcription}'}</code> in your
            prompt to add the selected video transcription.
          </p>
        </div>
        <aside className="w-80 space-y-8">
          <VideoInputForm onVideoUploaded={setVideoId} />

          <Separator />

          <AIInputForm
            onFormSubmit={handleOnFormSubmit}
            onAIPromptSelected={setInput}
            onAITemperatureChange={handleAITemperatureChange}
            isLoading={isLoading}
          />

          <UserAlert
            onClose={handleUserAlertClose}
            openTrigger={openUserAlert}
            title={userAlertTitle}
            message={userAlertMessage}
            actionText={userAlertActionText}
          />
        </aside>
      </main>
    </div>
  )
}
