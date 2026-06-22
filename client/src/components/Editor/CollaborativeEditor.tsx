import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import type { SocketIOProvider } from '../../lib/yjsSocketProvider';
import { syncforgeDarkTheme, LANGUAGE_EXTENSIONS, DEFAULT_CODE } from '../../lib/themes';
import type { editor as MonacoEditor } from 'monaco-editor';

interface Props {
  ydoc: Y.Doc;
  provider: SocketIOProvider;
  language: string;
  defaultCode: string;
}

export default function CollaborativeEditor({ ydoc, provider, language, defaultCode }: Props) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const [ready, setReady] = useState(false);

  const handleMount: OnMount = (editor, monaco) => {
    // Register custom theme
    monaco.editor.defineTheme('syncforge-dark', syncforgeDarkTheme);
    monaco.editor.setTheme('syncforge-dark');
    editorRef.current = editor;

    // Focus editor
    editor.focus();
    setReady(true);
  };

  // Bind to Yjs and update language
  useEffect(() => {
    if (!ready || !editorRef.current) return;
    
    const editor = editorRef.current;
    const monaco = (window as any).monaco;
    
    if (monaco) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, LANGUAGE_EXTENSIONS[language] || 'plaintext');
      }
    }

    // Destroy old binding
    if (bindingRef.current) {
      bindingRef.current.destroy();
    }

    // Get or initialize the shared Y.Text for this specific language
    const yText = ydoc.getText(`monaco-${language}`);

    // If the doc is empty and we have default code, insert it
    if (yText.length === 0 && defaultCode) {
      yText.insert(0, defaultCode);
    }

    // Bind Monaco model to the new Y.Text
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel()!,
      new Set([editor]),
      provider.awareness,
    );

    return () => {
      // Don't destroy here because we want to keep it alive until next language switch
      // Actually we should clean up if unmounting, but the next effect run will clean it up anyway
    };
  }, [language, ready, ydoc, provider, defaultCode]);

  // Final cleanup
  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
    };
  }, []);

  return (
    <Editor
      height="100%"
      language={LANGUAGE_EXTENSIONS[language] || 'plaintext'}
      theme="syncforge-dark"
      onMount={handleMount}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16 },
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        formatOnPaste: true,
      }}
      loading={
        <div className="loading-screen">
          <div className="spinner" />
          <p className="loading-text">Loading editor...</p>
        </div>
      }
    />
  );
}
