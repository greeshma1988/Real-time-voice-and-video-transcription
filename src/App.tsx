import React, { useState } from 'react';
import { Mic, MicOff, Trash2 } from 'lucide-react';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import AudioVisualizer from './components/AudioVisualizer';
import TranscriptionBox from './components/TranscriptionBox';
import VideoTranscription from './components/VideoTranscription';

function App() {
  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error
  } = useSpeechRecognition();

  const [videoTranscript, setVideoTranscript] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Voice & Video Transcription
            </h1>
            <p className="text-gray-600">
              Transcribe your voice in real-time or upload a video for transcription
            </p>
          </div>

          {/* Voice Transcription Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Voice Transcription</h2>
            
            <AudioVisualizer isListening={isListening} />

            <div className="flex justify-center gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all
                  ${isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </button>
              <button
                onClick={resetTranscript}
                className="px-6 py-3 rounded-full font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Clear
              </button>
            </div>

            {error && (
              <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
                {error}
              </div>
            )}

            <TranscriptionBox
              transcript={transcript}
              interimTranscript={interimTranscript}
            />
          </div>

          {/* Video Transcription Section */}
          <div className="space-y-8 border-t pt-12">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Video Transcription</h2>
            <VideoTranscription onTranscriptionComplete={setVideoTranscript} />
            {videoTranscript && (
              <TranscriptionBox
                transcript={videoTranscript}
                interimTranscript=""
              />
            )}
          </div>

          {/* Browser Support Notice */}
          <p className="text-center text-sm text-gray-500">
            Note: This application works best in Chrome and Edge browsers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;