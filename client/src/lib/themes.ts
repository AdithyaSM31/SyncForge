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
  javascript: `// Welcome to SyncForge! 🚀
// Start coding collaboratively...

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`  fib(\${i}) = \${fibonacci(i)}\`);
}
`,
  python: `# Welcome to SyncForge! 🚀
# Start coding collaboratively...

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"  fib({i}) = {fibonacci(i)}")
`,
  cpp: `// Welcome to SyncForge! 🚀
// Start coding collaboratively...

#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Fibonacci sequence:" << endl;
    for (int i = 0; i < 10; i++) {
        cout << "  fib(" << i << ") = " << fibonacci(i) << endl;
    }
    return 0;
}
`,
  c: `/* Welcome to SyncForge! 🚀 */
/* Start coding collaboratively... */

#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Fibonacci sequence:\\n");
    for (int i = 0; i < 10; i++) {
        printf("  fib(%d) = %d\\n", i, fibonacci(i));
    }
    return 0;
}
`,
  java: `// Welcome to SyncForge! 🚀
// Start coding collaboratively...

public class Main {
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("  fib(" + i + ") = " + fibonacci(i));
        }
    }
}
`,
  go: `// Welcome to SyncForge! 🚀
// Start coding collaboratively...

package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Fibonacci sequence:")
    for i := 0; i < 10; i++ {
        fmt.Printf("  fib(%d) = %d\\n", i, fibonacci(i))
    }
}
`,
};
