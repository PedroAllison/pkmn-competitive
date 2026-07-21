// Liga o WSL2 antes do dev subir. Postgres e Redis rodam dentro da distro
// Ubuntu como serviços systemd habilitados — assim que a VM liga, os dois
// sobem sozinhos, sem precisar de nenhum comando extra manual.
//
// Só faz sentido no Windows. Em outro SO (ou se o WSL não estiver
// instalado) apenas avisa e segue — nesse caso Postgres/Redis precisam
// estar rodando localmente por conta própria.
const { execSync } = require('node:child_process');

if (process.platform !== 'win32') {
  process.exit(0);
}

try {
  execSync('wsl -d Ubuntu -- true', { stdio: 'inherit' });
  console.log('✓ WSL (Postgres/Redis) pronto.');
} catch {
  console.warn(
    'Aviso: não consegui iniciar o WSL automaticamente. Se o backend não conectar no banco, rode "wsl -d Ubuntu -- true" manualmente antes.',
  );
}
