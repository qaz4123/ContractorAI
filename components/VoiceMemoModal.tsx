
import React, { useState, useRef, useEffect } from 'react';
import { analyzeVoiceMemo } from '../services/geminiService';

interface VoiceMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string[]) => void;
}

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'analyzing' | 'complete';

const fileToBase64 = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); // remove the data URI prefix
        reader.onerror = error => reject(error);
});

const VoiceMemoModal: React.FC<VoiceMemoModalProps> = ({ isOpen, onClose, onSave }) => {
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{ summary: string; actionItems: string[] } | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    
    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setStatus('idle');
            setError(null);
            setAnalysisResult(null);
            setSelectedTasks([]);
            mediaRecorderRef.current = null;
            audioChunksRef.current = [];
        }
    }, [isOpen]);

    const startRecording = async () => {
        setError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    setStatus('analyzing');
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    try {
                        const audioBase64 = await fileToBase64(audioBlob);
                        const result = await analyzeVoiceMemo(audioBase64);
                        setAnalysisResult(result);
                        setSelectedTasks(result.actionItems); // Select all by default
                        setStatus('complete');
                    } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to analyze audio.");
                        setStatus('idle');
                    }
                     // Stop the media stream tracks to turn off the mic indicator
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setStatus('recording');
            } catch (err) {
                setError("Microphone access was denied. Please enable it in your browser settings.");
            }
        } else {
            setError("Audio recording is not supported by your browser.");
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const handleTaskToggle = (task: string) => {
        setSelectedTasks(prev => 
            prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
        );
    };

    const handleSave = () => {
        if (!analysisResult) return;
        
        const notesToSave: string[] = [];
        const summaryNote = `Voice Memo Summary:\n${analysisResult.summary}`;
        notesToSave.push(summaryNote);

        selectedTasks.forEach(task => {
            notesToSave.push(`ACTION ITEM: ${task}`);
        });

        onSave(notesToSave);
        onClose();
    };


    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <div className="text-center">
                        <p className="text-slate-600 mb-6">Record a quick summary or notes after a client meeting. AI will transcribe, summarize, and suggest action items.</p>
                        <button onClick={startRecording} className="bg-red-600 text-white rounded-full h-20 w-20 flex items-center justify-center mx-auto hover:bg-red-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 5.5A.5.5 0 016 5v4a4 4 0 008 0V5a.5.5 0 011 0v4a5 5 0 01-10 0V5A.5.5 0 015.5 5.5z" /><path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
                        </button>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                );
            case 'recording':
                 return (
                    <div className="text-center">
                        <p className="text-slate-600 mb-6">Recording... Speak clearly.</p>
                        <div className="flex justify-center items-center mb-6">
                            <span className="relative flex h-8 w-8">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500"></span>
                            </span>
                        </div>
                        <button onClick={stopRecording} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                           Stop & Analyze
                        </button>
                    </div>
                );
             case 'analyzing':
                return (
                    <div className="text-center py-10">
                         <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         <p className="text-slate-600 font-semibold">Analyzing your memo...</p>
                    </div>
                );
            case 'complete':
                return (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">AI Summary</h3>
                            <p className="text-sm text-slate-700 bg-slate-100 p-3 rounded-md border">{analysisResult?.summary}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Suggested Action Items</h3>
                            <div className="space-y-2">
                                {analysisResult?.actionItems.map((item, index) => (
                                    <label key={index} className="flex items-center p-2 bg-slate-100 rounded-md border has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300 transition-colors">
                                        <input type="checkbox" checked={selectedTasks.includes(item)} onChange={() => handleTaskToggle(item)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                        <span className="ml-3 text-sm text-slate-800">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Smart Voice Memo</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
                </div>

                <div className="p-6 min-h-[200px]">
                    {renderContent()}
                </div>

                {status === 'complete' && (
                    <div className="p-4 bg-slate-50 border-t rounded-b-lg flex gap-3">
                        <button onClick={onClose} className="w-full bg-slate-200 text-slate-800 py-2.5 rounded-md font-semibold hover:bg-slate-300">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700">
                           Save to Log
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceMemoModal;
