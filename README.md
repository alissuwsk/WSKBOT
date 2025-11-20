# 🤖 WSK BOT - 1.0

Um bot WhatsApp completo e poderoso com suporte a múltiplos comandos, gerenciamento de grupos, downloads de mídia, processamento de áudio/vídeo e muito mais!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)
![Status](https://img.shields.io/badge/status-ativo-success)

---

## 🚀 Instalação

### Pré-requisitos
- Node.js v22.0.0 ou superior (testado com v22.17.0)
- npm v10.0.0 ou superior
- Git (para clonar o repositório)
- FFmpeg (para processamento de áudio/vídeo)

### 📱 Instalação no Termux (Android) 

**1. Instale as dependências do sistema**
e
**Instale esse termux ou algum de sua preferencia que nao seja o da Play Store**
https://github.com/termux/termux-app/releases/download/v0.119.0-beta.3/termux-app_v0.119.0-beta.3+apt-android-7-github-debug_universal.apk

```bash
pkg update && pkg upgrade -y
pkg install nodejs git ffmpeg python -y
```

**2. Configure o diretório padrão (sdcard)**

**Primeiro, dê permissão ao Termux:**
```bash
termux-setup-storage
```

Pressione "Allow" quando pedir permissão no seu celular.

**Depois, mude para o diretório sdcard:**
```bash
cd /sdcard
```

**Configure para abrir sempre neste diretório:**
```bash
echo "cd /sdcard/wskbot" >> ~/.bashrc
```

Feche e abra o Termux novamente. Ele vai abrir direto na sdcard!

**3. Clone e configure**
```bash
git clone https://github.com/alissuwsk/wskbot.git
```
**. Caso nao esteja na pasta do bot, use:**
```bash
cd wskbot
```

**Instale as dependências (com suporte a Termux):**
```bash
npm install --cpu=wasm32 sharp
```

**4. Configure a API Key** (`utils/key.json`)
```bash
nano utils/key.json
```
Adicione:
```json
{
  "apiKey": "sua_chave_aqui",
  "note": "Obtenha sua key em: https://wsksystem.com"
}
```

**5. Configure o Bot** (`config.json`)
```bash
nano config.json
```
Adicione:
```json
{
  "prefix": "!",
  "ownerNumber": "5528999576743",
  "ownerName": "Seu Nome",
  "botName": "WSK BOT",
  "lidbot": ""
}
```

**6. Inicie o Bot**
```bash
npm start
```

**Dica Termux:** Para manter o bot rodando mesmo fechando o app:
```bash
nohup npm start > bot.log 2>&1 &
```

---

### 🖥️ Instalação em VPS (Ubuntu/Debian)

**1. Conecte via SSH**
```bash
ssh usuario@seu_vps_ip
```

**2. Instale as dependências**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm git ffmpeg -y
```

**3. Clone e configure**
```bash
git clone https://github.com/alissuwsk/wskbot.git
cd wskbot
npm install
```

**4. Configure a API Key e Bot**
```bash
nano utils/key.json
nano config.json
```

**5. Inicie com PM2 (recomendado para VPS)**
```bash
# Instale PM2 globalmente
sudo npm install -g pm2

# Inicie o bot com PM2
pm2 start index.js --name "wskbot"

# Salve a configuração
pm2 save

# Inicie automaticamente ao reiniciar
pm2 startup
```

**Comandos úteis PM2:**
```bash
pm2 status              # Ver status
pm2 logs wskbot         # Ver logs
pm2 restart wskbot      # Reiniciar
pm2 stop wskbot         # Parar
pm2 delete wskbot       # Remover
```

---

### 💻 Instalação no Windows/Linux/macOS (Desktop)

**1. Clone o repositório**
```bash
git clone https://github.com/alissuwsk/wskbot.git
cd wskbot
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure a API Key** (`utils/key.json`)
```json
{
  "apiKey": "sua_chave_aqui",
  "note": "Obtenha sua key em: https://wsksystem.com"
}
```

**4. Configure o Bot** (`config.json`)
```json
{
  "prefix": "!",
  "ownerNumber": "5528999576743",
  "ownerName": "Seu Nome",
  "botName": "WSK BOT",
  "lidbot": ""
}
```

**5. Inicie o Bot**
```bash
npm start
```

---

### ✅ Verificar Instalação

```bash
# Verificar Node.js
node -v

# Verificar npm
npm -v

# Verificar FFmpeg
ffmpeg -version

# Testar o bot
npm start
```

Pareie o codigo com seu Whatsapp para se conectar!

---

## ⚡ Quick Start

Após iniciar o bot, teste com alguns comandos:

```bash
# No WhatsApp, envie:
!ping                    # Verificar se o bot está online
!info sticker           # Ver informações de um comando
!play nome da música   # Baixar música do YouTube
!clima São Paulo        # Ver o clima
```

**Dicas:**
- Use `!menu` para ver todos os comandos disponíveis
- Use `!info comando` para saber como usar qualquer comando
- Admins podem usar `!menuadm` para comandos de administração
- O dono pode usar `!menudono` para comandos exclusivos

---

## 📋 Comandos

### 🔍 Pesquisas & Downloads
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `play` | Baixar áudio do YouTube | `!play nome/link` |
| `playmp3` | Baixar MP3 do YouTube | `!playmp3 nome/link` |
| `playmp4` | Baixar vídeo do YouTube | `!playmp4 nome/link` |
| `spotify` | Baixar do Spotify | `!spotify link` |
| `tiktok` | Baixar TikTok HD | `!tiktok link` |
| `instagram` | Baixar do Instagram | `!instagram link` |
| `facebook` | Baixar do Facebook | `!facebook link` |
| `twitter` | Baixar do Twitter | `!twitter link` |
| `pinterest` | Buscar no Pinterest | `!pinterest pesquisa` |
| `soundcloud` | Baixar do SoundCloud | `!soundcloud link` |

### 🎨 Figurinhas & Imagens
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `sticker` | Criar figurinha | `!sticker (marque imagem)` |
| `toimg` | Figurinha → Imagem | `!toimg (marque figurinha)` |
| `togif` | Figurinha → GIF | `!togif (marque figurinha)` |
| `sfundo` | Remover fundo | `!sfundo (marque imagem)` |
| `attp` | Texto animado | `!attp texto` |
| `emoji` | Emoji como figurinha | `!emoji ❤/ios` |

### 🎤 Áudio
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `audio2text` | Transcrever áudio | `!audio2text (marque áudio)` |
| `translater` | Traduzir áudio | `!translater (marque áudio)` |
| `bass` | Efeito bass | `!bass (marque áudio)` |
| `reverb` | Efeito reverb | `!reverb (marque áudio)` |

### 👥 Gerenciamento de Grupo
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `grupo` | Abrir/fechar grupo | `!grupo f` (fecha) / `!grupo a` (abre) |
| `ban` | Banir membro | `!ban @usuario` |
| `promover` | Promover a admin | `!promover @usuario` |
| `rebaixar` | Remover admin | `!rebaixar @usuario` |
| `totag` | Mencionar todos | `!totag mensagem` |
| `antilink` | Ativar anti-link | `!antilink 1` |
| `antilink2` | Anti-link seletivo | `!antilink2 1` |
| `antilink3` | Anti-link tolerância zero | `!antilink3 1` |
| `advertencia` | Dar advertência | `!advertencia @usuario` |
| `blacklist` | Gerenciar blacklist | `!addblacklist número` |

### 💰 Sistema Gold
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `banco` | Ver saldo | `!banco` |
| `cassino` | Jogar cassino | `!cassino 100` |
| `trade` | Apostar no trader | `!trade 100 subir` |
| `double` | Jogar double | `!double 100 vermelho` |
| `pix` | Transferir moedas | `!pix 100 @usuario` |
| `rankbanco` | Ranking de riqueza | `!rankbanco` |

### ℹ️ Informações
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `ping` | Status do bot | `!ping` |
| `info` | Informações de comando | `!info sticker` |
| `clima` | Previsão do tempo | `!clima São Paulo` |
| `maps` | Localização | `!maps Avenida Paulista` |
| `ddd` | Info de DDD | `!ddd 11` |
| `perfil` | Seu perfil | `!perfil` |

### 👑 Comandos do Dono
| Comando | Descrição | Uso |
|---------|-----------|-----|
| `setprefix` | Mudar prefixo | `!setprefix !` |
| `nickbot` | Mudar nome do bot | `!nickbot Novo Nome` |
| `setmenu` | Definir menu | `!setmenu (marque imagem)` |
| `bangp` | Ban grupo | `!bangp` |
| `unbangp` | Desban grupo | `!unbangp` |
| `blacklistG` | Blacklist global | `!addblacklistG número` |

---

## 🔐 Segurança

- ✅ Proteção contra spam e flood
- ✅ Sistema de blacklist (local e global)
- ✅ Validação de permissões em todos os comandos
- ✅ Proteção contra números estrangeiros (anti-fake)
- ✅ Sistema de advertências antes de banir
- ✅ Modo silencioso para grupos específicos

---

## 📊 Estatísticas

O bot rastreia:
- Mensagens por usuário
- Comandos utilizados
- Nível e XP (modo brincadeira)
- Saldo de moedas (sistema gold)
- Histórico de transações

---

## 🐛 Troubleshooting

### Bot não conecta
```bash
# Limpe as credenciais e tente novamente
rm -rf database/QRCODE/alissuwsk
npm start
```

**Soluções adicionais:**
- Verifique sua conexão de internet
- Tente parear o codigo novamente.
- Certifique-se de que o WhatsApp está ativo no seu celular

### Erro de API Key
- Verifique se a chave está correta em `utils/key.json`
- Obtenha uma nova em: https://wsksystem.com
- Certifique-se de que a chave não expirou
- Teste a chave diretamente no site da API


### Erro de permissão
```bash
# Linux/macOS
chmod +x index.js
npm start
```

### Erro de memória
```bash
# Aumentar limite de memória do Node
node --max-old-space-size=4096 index.js
```

### Comandos não funcionam
- Verifique se o prefixo está correto em `config.json`
- Certifique-se de que o bot tem permissões no grupo

---


## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Entre em meu grupo de informe melhorias https://chat.whatsapp.com/KOj4t8KB7wgAFQBK7UdG6Q
2. reporte problemas em meu grupo
3. acesse meu canal pra ser informado de atualizações sobre bot e api https://whatsapp.com/channel/0029Vb6LJci9MF98WO19ae2v




---

## 👨‍💻 Autor

**Alissu WSK**
- WhatsApp: [Contato](https://wa.me/5528999576743)
- GitHub: [@alissuwsk](https://github.com/alissuwsk)

---

## ⚠️ Aviso Legal

Este bot é fornecido "como está" para fins educacionais e pessoais. O uso deve estar em conformidade com os Termos de Serviço do WhatsApp. O autor não é responsável por mau uso.

---

## 📞 Suporte

Encontrou um bug? Abra uma [issue](https://github.com/alissuwsk/wskbot/issues)!

Tem uma sugestão? Deixe um comentário ou abra uma [discussion](https://github.com/alissuwsk/wskbot/discussions)!

---

**⭐ Se este projeto foi útil, considere dar uma seu feed back!**
