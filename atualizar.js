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

async function atualizar() {
  try {
    log('\n📦 Iniciando atualização...', 'azul');
    
    log('🔄 Verificando mudanças no GitHub...', 'amarelo');
    execSync('git fetch origin main', { stdio: 'inherit' });
    
    log('📊 Comparando versões...', 'amarelo');
    const diff = execSync('git diff --name-only origin/main', { encoding: 'utf-8' }).trim();
    
    if (!diff) {
      log('✅ Seu projeto já está atualizado!', 'verde');
      return;
    }
    
    const arquivos = diff.split('\n').filter(a => a.endsWith('.js') || a.endsWith('.json') || a.endsWith('.md') || a.endsWith('.txt'));
    
    if (arquivos.length === 0) {
      log('✅ Nenhum arquivo .js ou .json para atualizar', 'verde');
      return;
    }
    
    log(`\n📝 Arquivos que serão atualizados (${arquivos.length}):`, 'amarelo');
    arquivos.forEach(arq => log(`   • ${arq}`, 'azul'));
    
    log('\n⬇️  Atualizando arquivos...', 'amarelo');
    
    for (const arquivo of arquivos) {
      try {
        const conteudo = execSync(`git show origin/main:${arquivo}`, { encoding: 'utf-8' });
        const caminhoCompleto = path.join(__dirname, arquivo);
        
        // Criar diretório se não existir
        const diretorio = path.dirname(caminhoCompleto);
        if (!fs.existsSync(diretorio)) {
          fs.mkdirSync(diretorio, { recursive: true });
        }
        
        fs.writeFileSync(caminhoCompleto, conteudo, 'utf-8');
        log(`   ✓ ${arquivo}`, 'verde');
      } catch (erro) {
        log(`   ✗ Erro ao atualizar ${arquivo}: ${erro.message}`, 'vermelho');
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
