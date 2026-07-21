// Liga o WSL2 antes do dev subir. Postgres e Redis rodam dentro da distro
// Ubuntu como serviços systemd habilitados — assim que a VM liga, os dois
// sobem sozinhos, sem precisar de nenhum comando extra manual.
//
// Importante: `wsl -d Ubuntu -- true` sozinho NÃO basta — o comando termina
// na hora e, sem nenhum processo anexado à VM, o WSL2 desliga sozinho
// poucos segundos depois (derrubando Postgres/Redis junto). Por isso este
// script sobe um processo "âncora" (`sleep infinity`) desanexado, que fica
// vivo em segundo plano e mantém a VM ligada enquanto o Windows não reiniciar
// ou o processo não for encerrado manualmente.
//
// Só faz sentido no Windows. Em outro SO (ou se o WSL não estiver
// instalado) apenas avisa e segue — nesse caso Postgres/Redis precisam
// estar rodando localmente por conta própria.
const { execSync, spawn } = require('node:child_process');

if (process.platform !== 'win32') {
  process.exit(0);
}

function isWslUbuntuRunning() {
  try {
    const out = execSync('wsl -l -v', { encoding: 'utf16le' });
    return /Ubuntu\s+Running/i.test(out);
  } catch {
    return false;
  }
}

if (isWslUbuntuRunning()) {
  console.log('✓ WSL (Postgres/Redis) já está rodando.');
  process.exit(0);
}

console.log('Iniciando WSL (Postgres/Redis)...');
try {
  const keepAlive = spawn('wsl', ['-d', 'Ubuntu', '--', 'sleep', 'infinity'], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  keepAlive.unref();

  // Dá um tempo pro systemd subir postgres/redis dentro da VM antes do
  // backend tentar conectar.
  execSync('powershell -NoProfile -Command "Start-Sleep -Seconds 5"');
  console.log('✓ WSL (Postgres/Redis) pronto.');
} catch {
  console.warn(
    'Aviso: não consegui iniciar o WSL automaticamente. Se o backend não conectar no banco, rode "wsl -d Ubuntu -- sleep infinity" manualmente em outro terminal antes.',
  );
}
