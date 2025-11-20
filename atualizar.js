const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[36m'
};

function log(msg, cor = 'reset') {
  console.log(`${cores[cor]}${msg}${cores.reset}`);
}

// Pastas que contêm dados/configurações do usuário (JSONs NÃO devem ser atualizados)
const pastasDoUsuario = [
  'database/saves',
  'database/diversao/gold',
  'database/antiflood',
  'database/menuADM',
  'database/QRCODE'
];

function ehArquivoDoBotASeAtualizar(caminhoArquivo) {
  // JSONs em pastas de configuração do usuário NÃO atualiza
  for (const pasta of pastasDoUsuario) {
    if (caminhoArquivo.startsWith(pasta)) {
      return false;
    }
  }
  // Apenas raiz e database/comands/menubuttons JSONs são atualizados
  if (caminhoArquivo.endsWith('.json')) {
    return caminhoArquivo === 'config.json' || 
           caminhoArquivo === 'multiprefix.json' ||
           caminhoArquivo.startsWith('database/comands/menubuttons');
  }
  return true;
}

async function atualizar() {
  try {
    log('\n📦 Iniciando atualização...', 'azul');
    
    // Configurar git para Termux - tenta com git -C no diretório
    const repoPath = __dirname;
    try {
      execSync(`git -C "${repoPath}" config safe.directory "${repoPath}"`, { stdio: 'pipe' });
    } catch (e) {
      // Ignorar erro se já estiver configurado
    }
    
    log('🔄 Verificando mudanças no GitHub...', 'amarelo');
    execSync('git fetch origin main', { stdio: 'inherit' });
    
    log('📊 Comparando versões...', 'amarelo');
    const diff = execSync('git diff --name-only --no-renames origin/main', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }).trim();
    
    if (!diff) {
      log('✅ Seu projeto já está atualizado!', 'verde');
      return;
    }
    
    const todosArquivos = diff.split('\n').filter(a => a);
    // Filtrar apenas arquivos que DEVEM ser atualizados
    const arquivosAtualizaveis = todosArquivos.filter(ehArquivoDoBotASeAtualizar);
    
    if (arquivosAtualizaveis.length === 0) {
      log('✅ Seu projeto já está atualizado!', 'verde');
      return;
    }
    
    log(`⬇️  Atualizando ${arquivosAtualizaveis.length} arquivo(s)...`, 'amarelo');
    
    // Atualizar apenas arquivos selecionados
    for (const arquivo of arquivosAtualizaveis) {
      try {
        const conteudo = execSync(`git show origin/main:${arquivo}`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
        const caminhoCompleto = path.join(__dirname, arquivo);
        
        // Criar diretório se não existir
        const diretorio = path.dirname(caminhoCompleto);
        if (!fs.existsSync(diretorio)) {
          fs.mkdirSync(diretorio, { recursive: true });
        }
        
        fs.writeFileSync(caminhoCompleto, conteudo, 'utf-8');
        log(`   ✓ ${arquivo}`, 'verde');
      } catch (erro) {
        log(`   ✗ ${arquivo}: ${erro.message}`, 'vermelho');
      }
    }
    
    log('\n✅ Atualização concluída com sucesso!', 'verde');
    log('Reinicie o bot para aplicar as mudanças.\n', 'azul');
    
  } catch (erro) {
    log(`❌ Erro durante a atualização: ${erro.message}`, 'vermelho');
    process.exit(1);
  }
}

// Executar
atualizar();
