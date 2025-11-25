const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

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

// Configuração do repositório
const REPO_OWNER = 'seu-usuario'; // ALTERE AQUI
const REPO_NAME = 'WSKBOT'; // ALTERE AQUI
const BRANCH = 'main';

// Pastas que contêm dados/configurações do usuário
const pastasDoUsuario = [
    'database/saves',
    'database/diversao/gold',
    'database/antiflood',
    'database/menuADM',
    'database/QRCODE'
];

function ehArquivoDoBotASeAtualizar(caminhoArquivo) {
    // NENHUM JSON é atualizado
    if (caminhoArquivo.endsWith('.json')) {
        return false;
    }
    
    // JSONs em pastas de usuário NÃO atualiza
    for (const pasta of pastasDoUsuario) {
        if (caminhoArquivo.startsWith(pasta)) {
            return false;
        }
    }
    
    // Atualiza apenas .js, .md, .txt
    return caminhoArquivo.endsWith('.js') || 
           caminhoArquivo.endsWith('.md') || 
           caminhoArquivo.endsWith('.txt');
}

function verificarSeEhGit() {
    return fs.existsSync(path.join(__dirname, '.git'));
}

// ============ MÉTODO 1: ATUALIZAÇÃO VIA GIT ============
async function atualizarViaGit() {
    try {
        const repoPath = __dirname;
        
        try {
            execSync(`git -C "${repoPath}" config safe.directory "${repoPath}"`, { stdio: 'pipe' });
        } catch (e) {
            // Ignorar erro
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

        log(`⬇️ Atualizando ${arquivosAtualizaveis.length} arquivo(s)...`, 'amarelo');

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
                log(`  ✓ ${arquivo}`, 'verde');
            } catch (erro) {
                log(`  ✗ ${arquivo}: ${erro.message}`, 'vermelho');
            }
        }

        log('\n✅ Atualização concluída com sucesso!', 'verde');
        log('Reinicie o bot para aplicar as mudanças.\n', 'azul');
        
    } catch (erro) {
        throw erro;
    }
}

// ============ MÉTODO 2: ATUALIZAÇÃO VIA API DO GITHUB ============
function baixarArquivo(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 'User-Agent': 'WSKBOT-Updater' }
        }, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                return baixarArquivo(res.headers.location).then(resolve).catch(reject);
            }
            
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function obterListaArquivos(tree, caminho = '') {
    let arquivos = [];
    
    for (const item of tree) {
        const caminhoCompleto = caminho ? `${caminho}/${item.path}` : item.path;
        
        if (item.type === 'blob') {
            arquivos.push(caminhoCompleto);
        } else if (item.type === 'tree') {
            // Recursivamente buscar em subdiretórios
            // Nota: isso requer chamadas adicionais à API
        }
    }
    
    return arquivos;
}

async function atualizarViaSemGit() {
    try {
        log('🔄 Buscando atualizações do GitHub (método API)...', 'amarelo');
        
        // Buscar commit mais recente
        const commitUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${BRANCH}`;
        const commitData = await baixarArquivo(commitUrl);
        const commit = JSON.parse(commitData);
        const treeSha = commit.commit.tree.sha;
        
        // Buscar árvore de arquivos
        const treeUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${treeSha}?recursive=1`;
        const treeData = await baixarArquivo(treeUrl);
        const tree = JSON.parse(treeData).tree;
        
        // Filtrar apenas arquivos atualizáveis
        const arquivosAtualizaveis = tree
            .filter(item => item.type === 'blob')
            .map(item => item.path)
            .filter(ehArquivoDoBotASeAtualizar);
        
        if (arquivosAtualizaveis.length === 0) {
            log('✅ Nenhum arquivo para atualizar!', 'verde');
            return;
        }
        
        log(`⬇️ Atualizando ${arquivosAtualizaveis.length} arquivo(s)...`, 'amarelo');
        
        let sucessos = 0;
        let erros = 0;
        
        for (const arquivo of arquivosAtualizaveis) {
            try {
                // Baixar arquivo raw do GitHub
                const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${arquivo}`;
                const conteudo = await baixarArquivo(rawUrl);
                
                const caminhoCompleto = path.join(__dirname, arquivo);
                const diretorio = path.dirname(caminhoCompleto);
                
                if (!fs.existsSync(diretorio)) {
                    fs.mkdirSync(diretorio, { recursive: true });
                }
                
                fs.writeFileSync(caminhoCompleto, conteudo, 'utf-8');
                log(`  ✓ ${arquivo}`, 'verde');
                sucessos++;
                
            } catch (erro) {
                log(`  ✗ ${arquivo}: ${erro.message}`, 'vermelho');
                erros++;
            }
        }
        
        log(`\n✅ Atualização concluída: ${sucessos} sucesso(s), ${erros} erro(s)`, 'verde');
        log('Reinicie o bot para aplicar as mudanças.\n', 'azul');
        
    } catch (erro) {
        throw erro;
    }
}

// ============ FUNÇÃO PRINCIPAL ============
async function atualizar() {
    try {
        log('\n📦 Iniciando atualização...', 'azul');
        
        const ehGit = verificarSeEhGit();
        
        if (ehGit) {
            log('🔧 Detectado repositório Git', 'azul');
            await atualizarViaGit();
        } else {
            log('📁 Detectado instalação via ZIP', 'azul');
            log('💡 Dica: Clone via Git para atualizações mais rápidas:', 'amarelo');
            log(`   git clone https://github.com/${REPO_OWNER}/${REPO_NAME}.git\n`, 'amarelo');
            await atualizarViaSemGit();
        }
        
    } catch (erro) {
        log(`\n❌ Erro durante a atualização: ${erro.message}`, 'vermelho');
        
        if (!verificarSeEhGit()) {
            log('\n💡 SOLUÇÃO: Clone o repositório corretamente:', 'amarelo');
            log(`   git clone https://github.com/${REPO_OWNER}/${REPO_NAME}.git`, 'azul');
            log('   cd ${REPO_NAME}', 'azul');
            log('   npm install', 'azul');
        }
        
        process.exit(1);
    }
}

// Executar
atualizar();
