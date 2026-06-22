import { editor } from 'monaco-editor';

export const syncforgeDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', foreground: 'e6edf3', background: '0a0e17' },
    { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'ff7b72' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'number', foreground: '79c0ff' },
    { token: 'type', foreground: 'ffa657' },
    { token: 'function', foreground: 'd2a8ff' },
    { token: 'variable', foreground: 'ffa657' },
    { token: 'constant', foreground: '79c0ff' },
    { token: 'operator', foreground: 'ff7b72' },
    { token: 'delimiter', foreground: 'e6edf3' },
    { token: 'tag', foreground: '7ee787' },
    { token: 'attribute.name', foreground: '79c0ff' },
    { token: 'attribute.value', foreground: 'a5d6ff' },
  ],
  colors: {
    'editor.background': '#0a0e17',
    'editor.foreground': '#e6edf3',
    'editor.lineHighlightBackground': '#161b2240',
    'editor.selectionBackground': '#264f7840',
    'editor.inactiveSelectionBackground': '#264f7820',
    'editorLineNumber.foreground': '#484f58',
    'editorLineNumber.activeForeground': '#8b949e',
    'editorCursor.foreground': '#58a6ff',
    'editor.selectionHighlightBackground': '#264f7830',
    'editorBracketMatch.background': '#264f7840',
    'editorBracketMatch.border': '#58a6ff50',
    'editorIndentGuide.background': '#21262d',
    'editorIndentGuide.activeBackground': '#30363d',
    'editorWidget.background': '#161b22',
    'editorWidget.border': '#30363d',
    'editorSuggestWidget.background': '#161b22',
    'editorSuggestWidget.border': '#30363d',
    'editorSuggestWidget.selectedBackground': '#1c2333',
    'input.background': '#0d1117',
    'input.border': '#30363d',
    'input.foreground': '#e6edf3',
    'scrollbarSlider.background': '#484f5830',
    'scrollbarSlider.hoverBackground': '#484f5850',
    'scrollbarSlider.activeBackground': '#484f5870',
  },
};

export const LANGUAGE_EXTENSIONS: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  c: 'c',
  java: 'java',
  go: 'go',
};

export const DEFAULT_CODE: Record<string, string> = {
  javascript: `// Online JavaScript compiler to run JavaScript program online
// Start coding collaboratively...

console.log("Start small. Ship something.");
`,
  python: `# Online Python compiler to run Python program online
# Start coding collaboratively...

print("Start small. Ship something.")
`,
  cpp: `// Online C++ compiler to run C++ program online
// Start coding collaboratively...

#include <iostream>

int main() {
    std::cout << "Start small. Ship something.";
    return 0;
}
`,
  c: `/* Online C compiler to run C program online */
/* Start coding collaboratively... */

#include <stdio.h>

int main() {
    printf("Start small. Ship something.");
    return 0;
}
`,
  java: `// Online Java compiler to run Java program online
// Start coding collaboratively...

public class Main {
    public static void main(String[] args) {
        System.out.println("Start small. Ship something.");
    }
}
`,
  go: `// Online Go compiler to run Go program online
// Start coding collaboratively...

package main

import "fmt"

func main() {
    fmt.Println("Start small. Ship something.")
}
`,
};
