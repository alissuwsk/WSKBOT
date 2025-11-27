const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const AdmZip = require('adm-zip');

const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(msg, cor = 'reset') {
  console.log(`${cores[cor]}${msg}${cores.reset}`);
}

// Pastas que contêm dados/configurações do usuário
const pastasDoUsuario = [
  'database/saves',
  'database/diversao/gold',
  'database/antiflood',
  'database/menuADM',
  'database/QRCODE'
];

function ehArquivoDoBotASeAtualizar(caminhoArquivo) {
  if (caminhoArquivo.endsWith('.json')) {
    return false;
  }
  
  for (const pasta of pastasDoUsuario) {
    if (caminhoArquivo.startsWith(pasta)) {
      return false;
    }
  }
  
  return caminhoArquivo.endsWith('.js') || 
         caminhoArquivo.endsWith('.md') || 
         caminhoArquivo.endsWith('.txt');
}

function ehRepositorioGit() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function gitEstaInstalado() {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

// Converter projeto ZIP para repositório Git
async function converterParaGit() {
  try {
    const owner = 'alissuwsk';
    const repo = 'WSKBOT';
    const branch = 'main';
    
    log('\n🔧 Convertendo para repositório Git...', 'magenta');
    log('   Isso vai deixar as próximas atualizações MUITO mais rápidas!', 'amarelo');
    
    // Limpar configurações anteriores se existirem
    try {
      if (fs.existsSync('.git')) {
        log('   Limpando configuração Git anterior...', 'amarelo');
        fs.rmSync('.git', { recursive: true, force: true });
      }
    } catch (e) {
      // Ignorar erros de limpeza
    }
    
    // Inicializar repositório Git
    log('   Inicializando repositório...', 'amarelo');
    execSync('git init', { stdio: 'pipe' });
    
    // Adicionar remote
    log('   Conectando ao GitHub...', 'amarelo');
    execSync(`git remote add origin https://github.com/${owner}/${repo}.git`, { stdio: 'pipe' });
    
    // Configurar safe directory
    const repoPath = __dirname;
    try {
      execSync(`git config safe.directory "${repoPath}"`, { stdio: 'pipe' });
    } catch (e) {
      // Ignorar se já configurado
    }
    
    // Fazer fetch do repositório
    log('   Baixando histórico do repositório...', 'amarelo');
    execSync(`git fetch origin ${branch}`, { stdio: 'pipe', maxBuffer: 50 * 1024 * 1024 });
    
    // Configurar branch para rastrear origin
    log('   Configurando branch principal...', 'amarelo');
    execSync(`git checkout -b ${branch}`, { stdio: 'pipe' });
    execSync(`git branch --set-upstream-to=origin/${branch} ${branch}`, { stdio: 'pipe' });
    
    // Resetar para o estado remoto, mas manter arquivos locais
    execSync('git reset origin/main', { stdio: 'pipe' });
    
    log('✅ Projeto convertido para Git com sucesso!', 'verde');
    log('   As próximas atualizações serão instantâneas! 🚀\n', 'verde');
    
    return true;
  } catch (erro) {
    log(`⚠️  Erro ao converter para Git:`, 'amarelo');
    log(`   ${erro.message}`, 'vermelho');
    
    // Limpar .git se falhou
    try {
      if (fs.existsSync('.git')) {
        fs.rmSync('.git', { recursive: true, force: true });
      }
    } catch (e) {
      // Ignorar
    }
    
    return false;
  }
}

// Download de arquivo via HTTPS
function downloadArquivo(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadArquivo(res.headers.location).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// Atualização via Git (para quem clonou)
async function atualizarViaGit() {
  try {
    const repoPath = __dirname;
    try {
      execSync(`git -C "${repoPath}" config safe.directory "${repoPath}"`, { stdio: 'pipe' });
    } catch (e) {
      // Ignorar se já configurado
    }
    
    log('🔄 Verificando mudanças no GitHub...', 'amarelo');
    execSync('git fetch origin main', { stdio: 'inherit' });
    
    log('📊 Comparando versões...', 'amarelo');
    const diff = execSync('git diff --name-only --no-renames origin/main', { 
      encoding: 'utf-8', 
      maxBuffer: 10 * 1024 * 1024 
    }).trim();
    
    if (!diff) {
      log('✅ Seu projeto já está atualizado!', 'verde');
      return;
    }
    
    const todosArquivos = diff.split('\n').filter(a => a);
    const arquivosAtualizaveis = todosArquivos.filter(ehArquivoDoBotASeAtualizar);
    
    if (arquivosAtualizaveis.length === 0) {
      log('✅ Seu projeto já está atualizado!', 'verde');
      return;
    }
    
    log(`⬇️  Atualizando ${arquivosAtualizaveis.length} arquivo(s)...`, 'amarelo');
    
    for (const arquivo of arquivosAtualizaveis) {
      try {
        const conteudo = execSync(`git show origin/main:${arquivo}`, { 
          encoding: 'utf-8', 
          maxBuffer: 10 * 1024 * 1024 
        });
        const caminhoCompleto = path.join(__dirname, arquivo);
        
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
    log('⚡ Próximas atualizações serão instantâneas!', 'verde');
    log('Reinicie o bot para aplicar as mudanças.\n', 'azul');
    
  } catch (erro) {
    throw erro;
  }
}

// Atualização via ZIP (para quem baixou ZIP)
async function atualizarViaZip() {
  try {
    const owner = 'alissuwsk';
    const repo = 'WSKBOT';
    const branch = 'main';
    
    log('🔄 Baixando última versão do GitHub...', 'amarelo');
    
    const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
    const zipBuffer = await downloadArquivo(zipUrl);
    
    log('📦 Extraindo arquivos...', 'amarelo');
    
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    let arquivosAtualizados = 0;
    let arquivosNovos = 0;
    
    log('📊 Verificando atualizações...', 'amarelo');
    
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      // Remover prefixo do nome da pasta do ZIP (ex: WSKBOT-main/)
      let caminhoArquivo = entry.entryName;
      const primeiraBarraIndex = caminhoArquivo.indexOf('/');
      if (primeiraBarraIndex !== -1) {
        caminhoArquivo = caminhoArquivo.substring(primeiraBarraIndex + 1);
      }
      
      if (!caminhoArquivo) continue;
      
      // Verificar se deve atualizar este arquivo
      if (!ehArquivoDoBotASeAtualizar(caminhoArquivo)) {
        continue;
      }
      
      const caminhoCompleto = path.join(__dirname, caminhoArquivo);
      const conteudoNovo = entry.getData();
      
      // Verificar se arquivo existe localmente
      if (fs.existsSync(caminhoCompleto)) {
        const conteudoLocal = fs.readFileSync(caminhoCompleto);
        
        // Comparar conteúdos
        if (Buffer.compare(conteudoLocal, conteudoNovo) === 0) {
          continue; // Arquivo não mudou
        }
        
        // Atualizar arquivo
        const diretorio = path.dirname(caminhoCompleto);
        if (!fs.existsSync(diretorio)) {
          fs.mkdirSync(diretorio, { recursive: true });
        }
        
        fs.writeFileSync(caminhoCompleto, conteudoNovo);
        log(`   ✓ ${caminhoArquivo} (atualizado)`, 'verde');
        arquivosAtualizados++;
      } else {
        // Arquivo novo
        const diretorio = path.dirname(caminhoCompleto);
        if (!fs.existsSync(diretorio)) {
          fs.mkdirSync(diretorio, { recursive: true });
        }
        
        fs.writeFileSync(caminhoCompleto, conteudoNovo);
        log(`   ✓ ${caminhoArquivo} (novo)`, 'azul');
        arquivosNovos++;
      }
    }
    
    if (arquivosAtualizados === 0 && arquivosNovos === 0) {
      log('✅ Seu projeto já está atualizado!', 'verde');
    } else {
      if (arquivosAtualizados > 0) {
        log(`\n✅ ${arquivosAtualizados} arquivo(s) atualizado(s)`, 'verde');
      }
      if (arquivosNovos > 0) {
        log(`✅ ${arquivosNovos} arquivo(s) novo(s) adicionado(s)`, 'verde');
      }
      log('Reinicie o bot para aplicar as mudanças.\n', 'azul');
    }
    
    // Sempre tentar converter para Git se possível
    if (gitEstaInstalado()) {
      const convertido = await converterParaGit();
      if (!convertido) {
        log('⚠️  Continuará usando método ZIP nas próximas atualizações.', 'amarelo');
      }
    } else {
      log('\n💡 Dica: Instale o Git para atualizações mais rápidas!', 'amarelo');
      log('   Windows: https://git-scm.com/download/win', 'azul');
      log('   Linux: sudo apt install git\n', 'azul');
    }
    
  } catch (erro) {
    throw erro;
  }
}

async function atualizar() {
  try {
    log('\n📦 Iniciando atualização...', 'azul');
    
    if (ehRepositorioGit()) {
      log('📂 Repositório Git detectado', 'azul');
      await atualizarViaGit();
    } else {
      if (gitEstaInstalado()) {
        log('📦 Projeto baixado via ZIP detectado', 'azul');
        log('💡 Git instalado - vou converter para Git após a atualização!', 'magenta');
      } else {
        log('📦 Projeto baixado via ZIP detectado', 'azul');
        log('💡 Dica: Instale o Git para atualizações mais rápidas!', 'amarelo');
      }
      await atualizarViaZip();
    }
    
  } catch (erro) {
    log(`❌ Erro durante a atualização: ${erro.message}`, 'vermelho');
    log('\n💡 Verifique sua conexão com a internet e tente novamente.', 'amarelo');
    process.exit(1);
  }
}

// Executar
atualizar();
