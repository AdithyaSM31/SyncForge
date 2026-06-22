import Docker from 'dockerode';
import { env } from '../config/env.js';

const docker = new Docker();

export interface LanguageConfig {
  image: string;
  fileName: string;
  buildCmd?: string;
  runCmd: string;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  javascript: {
    image: 'syncforge-sandbox-js',
    fileName: 'main.js',
    runCmd: 'node /code/main.js',
  },
  python: {
    image: 'syncforge-sandbox-python',
    fileName: 'main.py',
    runCmd: 'python3 /code/main.py',
  },
  cpp: {
    image: 'syncforge-sandbox-cpp',
    fileName: 'main.cpp',
    runCmd: 'g++ -o /tmp/a.out /code/main.cpp && /tmp/a.out',
  },
  c: {
    image: 'syncforge-sandbox-c',
    fileName: 'main.c',
    runCmd: 'gcc -o /tmp/a.out /code/main.c && /tmp/a.out',
  },
  java: {
    image: 'syncforge-sandbox-java',
    fileName: 'Main.java',
    runCmd: 'javac -d /tmp /code/Main.java && java -cp /tmp Main',
  },
  go: {
    image: 'syncforge-sandbox-go',
    fileName: 'main.go',
    runCmd: 'cd /code && go run main.go',
  },
};

export interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
}

export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIGS[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const startTime = Date.now();
  const timeoutSec = Math.floor(env.EXECUTION_TIMEOUT / 1000);
  const memoryBytes = env.EXECUTION_MEMORY_MB * 1024 * 1024;

  let container: Docker.Container | null = null;

  try {
    // Check if image exists, if not use fallback
    let imageName = config.image;
    try {
      await docker.getImage(imageName).inspect();
    } catch {
      // Fallback to public images if custom sandbox images aren't built
      const fallbacks: Record<string, string> = {
        javascript: 'node:20-alpine',
        python: 'python:3.12-alpine',
        cpp: 'gcc:13',
        c: 'gcc:13',
        java: 'eclipse-temurin:21-alpine',
        go: 'golang:1.22-alpine',
      };
      imageName = fallbacks[language] || imageName;
      try {
        await docker.getImage(imageName).inspect();
      } catch {
        // Pull the image
        console.log(`  📦 Pulling image: ${imageName}`);
        await new Promise<void>((resolve, reject) => {
          docker.pull(imageName, (err: Error | null, stream: NodeJS.ReadableStream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err2: Error | null) => {
              if (err2) return reject(err2);
              resolve();
            });
          });
        });
      }
    }

    // Create container with strict security limits
    container = await docker.createContainer({
      Image: imageName,
      Cmd: ['sh', '-c', `timeout ${timeoutSec} sh -c '${config.runCmd.replace(/'/g, "'\\''")}'`],
      WorkingDir: '/code',
      NetworkDisabled: true,
      HostConfig: {
        Memory: memoryBytes,
        MemorySwap: memoryBytes, // No swap
        CpuPeriod: 100000,
        CpuQuota: 50000, // 0.5 CPU
        PidsLimit: 50,
        ReadonlyRootfs: false, // Needs write for compilation
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges:true'],
        Tmpfs: {
          '/tmp': 'rw,noexec,nosuid,size=50m',
        },
      },
    });

    // Write code to container
    const tar = createTarBuffer(config.fileName, code);
    await container.putArchive(tar, { path: '/code' });

    // Start and wait
    await container.start();

    const result = await container.wait();
    const logs = await container.logs({ stdout: true, stderr: true, follow: false });
    const logStr = demuxDockerLogs(logs as unknown as Buffer);

    const executionTimeMs = Date.now() - startTime;
    const timedOut = result.StatusCode === 124; // timeout exit code

    return {
      output: logStr.stdout,
      error: logStr.stderr,
      exitCode: result.StatusCode,
      executionTimeMs,
      timedOut,
    };
  } catch (err: any) {
    console.error('Execution error:', err);
    
    // Fallback for Render Free Tier which doesn't support Docker-in-Docker
    if (err.message && err.message.includes('connect ENOENT')) {
      // Check if JDoodle credentials are provided as a workaround
      if (process.env.JDOODLE_CLIENT_ID && process.env.JDOODLE_CLIENT_SECRET) {
        return executeWithJDoodle(code, language, startTime);
      }

      return {
        output: '',
        error: '⚠️ Docker execution is disabled on Render.\n\n💡 WORKAROUND: Create a free JDoodle API account and add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET to your Render environment variables to enable cloud execution!',
        exitCode: -1,
        executionTimeMs: Date.now() - startTime,
        timedOut: false,
      };
    }

    return {
      output: '',
      error: err.message || 'Execution failed',
      exitCode: -1,
      executionTimeMs: Date.now() - startTime,
      timedOut: false,
    };
  } finally {
    // Always clean up container
    if (container) {
      try {
        await container.remove({ force: true });
      } catch {}
    }
  }
}

// ==========================================
// JDoodle API Fallback for Render Deployment
// ==========================================
async function executeWithJDoodle(code: string, language: string, startTime: number): Promise<ExecutionResult> {
  const jdoodleLangMap: Record<string, { language: string; versionIndex: string }> = {
    javascript: { language: 'nodejs', versionIndex: '4' }, // Node 17
    python: { language: 'python3', versionIndex: '4' },   // Python 3.9
    cpp: { language: 'cpp17', versionIndex: '1' },        // C++ 17
    c: { language: 'c', versionIndex: '5' },              // GCC
    java: { language: 'java', versionIndex: '4' },        // JDK 17
    go: { language: 'go', versionIndex: '4' },            // Go 1.17
  };

  const map = jdoodleLangMap[language];
  if (!map) {
    return { output: '', error: `Language ${language} not supported by JDoodle fallback.`, exitCode: 1, executionTimeMs: Date.now() - startTime, timedOut: false };
  }

  try {
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language: map.language,
        versionIndex: map.versionIndex,
      }),
    });

    const data = (await response.json()) as any;

    if (data.error) {
      return { output: '', error: data.error, exitCode: 1, executionTimeMs: Date.now() - startTime, timedOut: false };
    }

    return {
      output: data.output,
      error: data.memory === null ? 'Execution Timeout or Error' : null,
      exitCode: data.statusCode === 200 ? 0 : 1,
      executionTimeMs: Date.now() - startTime,
      timedOut: data.memory === null,
    };
  } catch (err: any) {
    return { output: '', error: `JDoodle API Error: ${err.message}`, exitCode: 1, executionTimeMs: Date.now() - startTime, timedOut: false };
  }
}

// Create a minimal tar archive with a single file
function createTarBuffer(fileName: string, content: string): Buffer {
  const fileContent = Buffer.from(content, 'utf-8');
  const headerSize = 512;
  const blockSize = 512;
  const contentBlocks = Math.ceil(fileContent.length / blockSize);
  const totalSize = headerSize + contentBlocks * blockSize + 1024; // 1024 for end-of-archive marker
  const tar = Buffer.alloc(totalSize, 0);

  // File name
  tar.write(fileName, 0, Math.min(fileName.length, 100), 'utf-8');
  // File mode
  tar.write('0000644\0', 100, 8, 'utf-8');
  // Owner/group IDs
  tar.write('0001000\0', 108, 8, 'utf-8');
  tar.write('0001000\0', 116, 8, 'utf-8');
  // File size (octal)
  tar.write(fileContent.length.toString(8).padStart(11, '0') + '\0', 124, 12, 'utf-8');
  // Mod time
  tar.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0', 136, 12, 'utf-8');
  // Type flag (regular file)
  tar.write('0', 156, 1, 'utf-8');

  // Checksum — fill with spaces first
  tar.write('        ', 148, 8, 'utf-8');
  let checksum = 0;
  for (let i = 0; i < headerSize; i++) {
    checksum += tar[i];
  }
  tar.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'utf-8');

  // File content
  fileContent.copy(tar, headerSize);

  return tar;
}

// Demux Docker logs (stdout/stderr multiplexed stream)
function demuxDockerLogs(buffer: Buffer): { stdout: string; stderr: string } {
  let stdout = '';
  let stderr = '';

  // Docker log output may be a simple string or multiplexed
  const str = buffer.toString('utf-8');

  // Try to detect multiplexed format (8-byte header per frame)
  if (buffer.length >= 8 && (buffer[0] === 1 || buffer[0] === 2) && buffer[1] === 0 && buffer[2] === 0 && buffer[3] === 0) {
    let offset = 0;
    while (offset < buffer.length - 8) {
      const streamType = buffer[offset];
      const frameSize = buffer.readUInt32BE(offset + 4);
      const frameContent = buffer.slice(offset + 8, offset + 8 + frameSize).toString('utf-8');

      if (streamType === 1) stdout += frameContent;
      else if (streamType === 2) stderr += frameContent;

      offset += 8 + frameSize;
    }
  } else {
    stdout = str;
  }

  return { stdout, stderr };
}

export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_CONFIGS);
}
