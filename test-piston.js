async function test() {
  try {
    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'python',
        version: '3.10.0',
        files: [{ content: 'print("Hello from Piston API!")' }]
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
test();
