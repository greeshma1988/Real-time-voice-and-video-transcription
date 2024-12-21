import React from 'react';

interface TranscriptionBoxProps {
  transcript: string;
  interimTranscript: string;
}

const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({ transcript, interimTranscript }) => {
  return (
    <div className="w-full max-w-2xl h-64 bg-white rounded-lg shadow-lg p-6 overflow-auto">
      <div className="space-y-4">
        {transcript && (
          <p className="text-gray-800 leading-relaxed">
            {transcript}
          </p>
        )}
        {interimTranscript && (
          <p className="text-gray-500 italic leading-relaxed">
            {interimTranscript}
          </p>
        )}
        {!transcript && !interimTranscript && (
          <p className="text-gray-400 text-center">
            Start speaking to see the transcription...
          </p>
        )}
      </div>
    </div>
  );
};

export default TranscriptionBox;