'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Mic, Loader2, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Language = 'en' | 'te';

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface ChatInputProps {
  onSendMessage: (text: string) => void;        // Called when a message is submitted
  currentLanguage: Language;                    // 'en' or 'te' for English or Telugu
  onLanguageChange: (lang: Language) => void;   // Function to switch language
  isSending: boolean;                           // Indicates if a message is being sent (for disabling input)
  isCapturingLead: boolean;                     // Used to disable mic during lead capture phase
  isRecording: boolean;                         // Indicates if voice recognition is ongoing
  setIsRecording: (newState: boolean) => void;  // Function to toggle voice recognition
  leadCaptureField?: string;                    // Optional field for capturing leads
}

export default function ChatInput({
  onSendMessage,
  currentLanguage,
  onLanguageChange,
  isSending,
  isCapturingLead,
  isRecording,
  setIsRecording,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize recognition only once
    if (!recognitionRef.current) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        toast({
          title: 'Voice Recognition Not Supported',
          description: 'Your browser does not support voice recognition.',
          variant: 'destructive',
        });
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = currentLanguage === 'en' ? 'en-US' : 'te-IN';

      recognition.onstart = () => {
        console.log("Voice recognition started");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("Raw recognition event:", event);
        
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        console.log("Transcript:", transcript, "Final:", lastResult.isFinal);
        
        if (lastResult.isFinal) {
          const finalTranscript = transcript.trim();
          setInputValue('');                      // <-- CLEAR the input field
          onSendMessage(finalTranscript);         
          setIsRecording(false);                 
        } else {
          setInputValue(transcript);              // interim results (live display)
        }
      };

      recognition.onerror = (event: any) => {
        let errorMsg = 'An unknown voice recognition error occurred.';
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMsg = 'Microphone not available. Please check your microphone settings.';
            break;
          case 'not-allowed':
            errorMsg = 'Microphone access denied. Please grant permission to use your microphone.';
            break;
          case 'aborted':
            errorMsg = 'Voice recognition was aborted. Please try again.';
            break;
          case 'network':
            errorMsg = 'Network error occurred. Please check your internet connection.';
            break;
          case 'bad-grammar':
            errorMsg = 'Bad grammar input. Please try speaking more clearly.';
            break;
          case 'language-not-supported':
            errorMsg = 'Language not supported. Please select a supported language.';
            break;
          default:
            errorMsg = `Error: ${event.error}`;
        }

        toast({
          title: 'Voice Recognition Error',
          description: errorMsg,
          variant: 'destructive',
        });
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording) {
          console.log("Recognition ended");
          // Don't auto-restart - let the user control when to start again
        }
      };

      // Clean up event listeners when component unmounts
      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRef.current = null;
          } catch (e) {
            console.error("Error cleaning up recognition:", e);
          }
        }
      };
    }

    // Update language when it changes
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLanguage === 'en' ? 'en-US' : 'te-IN';
    }
  }, [currentLanguage, onSendMessage, setIsRecording, toast]); // Removed isRecording from dependencies to prevent multiple reinitializations

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      try {
        recognition.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
        toast({
          title: 'Microphone Error',
          description: 'Could not activate microphone. Please check if it is connected and working properly.',
          variant: 'destructive',
        });
        setIsRecording(false);
        return;
      }
    }
  }, [isRecording, toast, setIsRecording]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isSending) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleLanguageToggle = () => {
    onLanguageChange(currentLanguage === 'en' ? 'te' : 'en');
  };

  const handleMicClick = () => {
    if (isCapturingLead || isSending) return;

    if (!recognitionRef.current) {
      toast({
        title: 'Voice Recognition Not Available',
        description: 'Your browser may not support this feature.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsRecording(!isRecording);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 left-0 right-0 z-10 flex items-center gap-2 p-4 bg-background border-t border-border shadow-md"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleLanguageToggle}
              aria-label={currentLanguage === 'en' ? 'Switch to Telugu' : 'Switch to English'}
              disabled={isSending || isRecording}
            >
              <span className="text-xl font-semibold">{currentLanguage === 'en' ? 'తె' : 'EN'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch to {currentLanguage === 'en' ? 'Telugu' : 'English'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message or use the mic..."
        className="flex-grow font-body"
        disabled={isSending || isRecording}
        aria-label="Chat message input"
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleMicClick}
              disabled={isSending || isCapturingLead}
              aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? 'Stop voice input' : 'Start voice input'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        type="submit"
        size="icon"
        disabled={isSending || isRecording || !inputValue.trim()}
        aria-label="Send message"
      >
        {isSending ? <Loader2 size={20} className="animate-spin" /> : <SendHorizontal size={20} />}
      </Button>
    </form>
  );
}
