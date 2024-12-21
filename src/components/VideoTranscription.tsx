import React, { useRef, useState } from 'react';
import { FileVideo, Download, Loader, AlertCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import axios from 'axios';

interface VideoTranscriptionProps {
  onTranscriptionComplete: (text: string) => void;
}

const VideoTranscription: React.FC<VideoTranscriptionProps> = ({ onTranscriptionComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout>();

  const API_KEY = import.meta.env.VITE_ASSEMBLY_AI_KEY;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/'))) {
      if (selectedFile.size > 1024 * 1024 * 100) { // 100MB limit
        setError('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
      setTranscription('');
      setError(null);
    } else {
      setError('Please select a valid video or audio file');
    }
  };

  const validateApiKey = () => {
    if (!API_KEY || API_KEY === 'your_assembly_ai_key_here') {
      throw new Error('Please set your AssemblyAI API key in the .env file');
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const response = await axios.post('https://api.assemblyai.com/v2/upload', file, {
        headers: {
          'authorization': API_KEY,
          'content-type': 'application/octet-stream',
          'transfer-encoding': 'chunked'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      return response.data.upload_url;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your AssemblyAI API key');
      }
      throw new Error('Failed to upload file: ' + (error.response?.data?.error || error.message));
    }
  };

  const startTranscription = async (audioUrl: string) => {
    try {
      const response = await axios.post('https://api.assemblyai.com/v2/transcript', {
        audio_url: audioUrl,
        language_detection: true
      }, {
        headers: {
          'authorization': API_KEY,
          'content-type': 'application/json',
        }
      });
      return response.data.id;
    } catch (error: any) {
      throw new Error('Failed to start transcription: ' + (error.response?.data?.error || error.message));
    }
  };

  const checkTranscriptionStatus = async (transcriptId: string) => {
    try {
      const response = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'authorization': API_KEY,
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to check status: ' + (error.response?.data?.error || error.message));
    }
  };

  const transcribeFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Validate API key first
      validateApiKey();

      // Step 1: Upload the file
      const uploadUrl = await uploadFile(file);

      // Step 2: Start transcription
      const transcriptId = await startTranscription(uploadUrl);

      // Step 3: Poll for completion
      pollingInterval.current = setInterval(async () => {
        try {
          const status = await checkTranscriptionStatus(transcriptId);
          
          if (status.status === 'completed') {
            clearInterval(pollingInterval.current);
            setTranscription(status.text);
            onTranscriptionComplete(status.text);
            setIsProcessing(false);
          } else if (status.status === 'error') {
            throw new Error(status.error || 'Transcription failed');
          }
        } catch (error: any) {
          clearInterval(pollingInterval.current);
          setError(error.message);
          setIsProcessing(false);
        }
      }, 3000);

    } catch (error: any) {
      console.error('Transcription error:', error);
      setError(error.message || 'Failed to transcribe file');
      setIsProcessing(false);
    }
  };

  const downloadTranscription = () => {
    if (!transcription) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = file ? 
        `${file.name.split('.')[0]}-transcription.txt` : 
        `transcription-${timestamp}.txt`;
      
      const content = `Transcription\n=============\n\nFile: ${file?.name}\nDate: ${new Date().toLocaleString()}\n\n${transcription}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, fileName);
    } catch (error) {
      setError('Failed to download transcription');
      console.error('Download error:', error);
    }
  };

  // Cleanup polling interval on unmount
  React.useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileVideo className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              {file ? (
                <>
                  <span className="font-semibold">{file.name}</span>
                  <br />
                  <span className="text-xs">Click to change file</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Click to upload or drag and drop</span>
                  <br />
                  <span className="text-xs">Supported formats: MP4, MP3, WAV, M4A (max 100MB)</span>
                </>
              )}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={transcribeFile}
              disabled={isProcessing}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Transcription'
              )}
            </button>

            {transcription && (
              <button
                onClick={downloadTranscription}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Transcription
              </button>
            )}
          </div>
        </div>
      )}

      {transcription && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Preview:</h3>
          <p className="whitespace-pre-wrap text-gray-700">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default VideoTranscription;