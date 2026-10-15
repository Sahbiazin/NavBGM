(() => {
  // Nomes das regiões, na mesma ordem usada pelo PokeMMO pras pastas sounds/<id>
  const REGIONS = { 0: 'Kanto', 1: 'Hoenn', 2: 'Unova', 3: 'Sinnoh', 4: 'Johto' };

  const chosen = new Map();         // arquivos OGG novos, chave "regiao:id"
  const existingTracks = new Map(); // faixas que já vieram no MOD importado
  const baseFiles = new Map();      // todo o resto do ZIP original, pra não perder nada no export
  const selectedIds = new Set();    // checkboxes marcados (upload em lote)
  const extras = { 0: [], 1: [], 2: [], 3: [], 4: [] }; // IDs manuais adicionados pelo usuário

  let iconFile = null;
  let originalIcon = null;
  let originalFileCount = 0;
  let encoderScript = null;
  let audioBusy = false;

  const $ = (id) => document.getElementById(id);
  const region = $('region');
  const encoder = new TextEncoder();
  const translations = {
    pt: {
      pageTitle: 'NavBGM — Criador de MODs de Música para PokéMMO', brandTagline: 'POKÉMMO MUSIC BUILDER',
      localStatus: 'funciona localmente no seu navegador', languageLabel: 'Idioma', helpButton: 'Como usar',
      introEyebrow: 'NAVBGM · CRIADOR DE MODS DE MÚSICA', introTitle: 'Sua trilha.<br><em>Sua jornada.</em>',
      introDescription: 'Monte sua seleção de músicas e prepare um pacote pronto para adicionar ao PokéMMO.',
      stepIdentity: 'Identidade', stepTracks: 'Faixas', stepExport: 'Exportar', identityTitle: 'Identidade do MOD',
      identityDescription: 'Esses dados aparecerão no gerenciador de mods do jogo.', importTitle: 'Já tem um MOD?',
      importDescription: 'Envie um arquivo .zip ou .mod para adicionar faixas sem perder o conteúdo existente.',
      noMod: 'Nenhum MOD carregado', openMod: 'Abrir MOD', defaultModName: 'Meu MOD de Música', modNameLabel: 'Nome do MOD <b>*</b>',
      importStatusLoaded: '{file} · {count} faixa(s) encontrada(s)',
      modNamePlaceholder: 'Ex.: Minha trilha de aventura', authorLabel: 'Autor <b>*</b>', authorPlaceholder: 'Seu nome',
      versionLabel: 'Versão', descriptionLabel: 'Descrição', descriptionPlaceholder: 'Conte um pouco sobre a seleção de músicas...',
      iconLabel: 'Ícone do MOD <small>OPCIONAL · PNG quadrado recomendado</small>', noIcon: 'Nenhum ícone selecionado',
      preservedIcon: 'Ícone existente será preservado', choosePng: 'Escolher PNG', tracksTitle: 'Escolha as faixas',
      tracksDescription: 'Selecione a região, encontre as músicas e envie OGG Vorbis ou MP3. A conversão requer internet; o áudio não é enviado.',
      regionLabel: 'Região', searchPlaceholder: 'Buscar faixa ou ID...', manualButton: '＋ ID manual',
      selectedZero: '0 IDs selecionados', selectedOne: '1 ID selecionado', selectedMany: '{count} IDs selecionados',
      bulkButton: '♫ Aplicar a mesma música', clearSelection: 'Limpar seleção', loadingTracks: 'Carregando faixas',
      formatHint: 'Aceitos: <b>.ogg</b> e <b>.mp3</b> · conversão local para OGG Vorbis (requer internet)', formatHintImported: 'Aceitos: <b>.ogg</b> e <b>.mp3</b> · conversão local (requer internet); originais preservados', convertingAudio: 'Convertendo para OGG Vorbis…',
      emptyHint: 'Não encontrou a faixa? Use <strong>+ ID manual</strong>. Você pode conferir o ID atual no jogo com <code>/bgm</code>.',
      summaryReady: 'Seu pacote está quase pronto', summaryAddTrack: 'Adicione pelo menos uma faixa para exportar.',
      summaryPreparedOne: '1 alteração preparada', summaryPreparedMany: '{count} alterações preparadas',
      summaryTrackReadyOne: '1 faixa pronta para o pacote', summaryTrackReadyMany: '{count} faixas prontas para o pacote',
      summaryKeepOne: 'O MOD carregado será preservado com 1 arquivo original e suas alterações.',
      summaryKeepMany: 'O MOD carregado será preservado com {count} arquivos originais e suas alterações.',
      summaryZipOne: 'Baixe o ZIP com 1 arquivo OGG.', summaryZipMany: 'Baixe o ZIP com {count} arquivos OGG.',
      exportButton: 'Baixar pacote .ZIP', privacyNotice: 'Os arquivos de áudio não saem do dispositivo; o codificador OGG é baixado ao converter MP3.',
      helpEyebrow: 'GUIA RÁPIDO', helpTitle: 'Como usar o NavBGM', closeHelp: 'Fechar instruções',
      helpStep1Title: 'Crie um MOD ou abra um existente',
      helpStep1Text: 'Preencha nome, autor, versão e descrição. Para atualizar, clique em <strong>Abrir MOD</strong> e selecione um arquivo .zip ou .mod. O NavBGM carrega as informações e preserva os arquivos existentes.',
      helpStep2Title: 'Escolha região e faixa',
      helpStep2Text: 'Selecione uma região, procure pelo nome ou ID e envie OGG Vorbis ou MP3 (conversão local; requer internet). As faixas da tela de login ficam em Unova (IDs 1159 e 1157). IDs já presentes no MOD aparecem marcados; o sistema pergunta antes de sobrescrevê-los. Use <strong>ID manual</strong> para faixas fora do catálogo.',
      helpStep3Title: 'Aplique uma música a vários IDs',
      helpStep3Text: 'Marque as caixas das faixas desejadas e escolha <strong>Aplicar a mesma música</strong>. O NavBGM avisa se algum ID já existir e permite sobrescrever esses conflitos ou manter as faixas atuais.',
      helpStep4Title: 'Baixe e instale o pacote',
      helpStep4Text: 'Clique em <strong>Baixar pacote .ZIP</strong> e coloque o arquivo em <code>PokeMMO/data/mods</code>. Ative o MOD no gerenciador do jogo. O áudio é processado no navegador e não é enviado a um servidor; ao converter MP3, o codificador é baixado sob demanda.',
      helpTip: '<strong>Dica:</strong> no jogo, use <code>/bgm</code> para descobrir o ID da faixa que está tocando. As pastas regionais são Kanto 0, Hoenn 1, Unova 2, Sinnoh 3 e Johto 4.',
      packTitle: 'Como o pacote é montado', packDescription: 'É essa estrutura que sai no ZIP baixado — nada além disso.',
      loginTracksTitle: 'Músicas da tela de login', loginTracksDescription: 'Essas faixas ficam na pasta sounds/2 (Unova).',
      loginTrackMain: 'Tela de login', loginTrackAlternative: 'Tela de login alternativa e incomum',
      historyTitle: 'Histórico de versões', historyV6Title: 'Conversão de áudio', historyV6Text: 'Envie MP3 e converta para OGG Vorbis no navegador antes de montar o pacote.', historyV5Title: 'Músicas da tela de login',
      historyV5Text: 'Seção dedicada na região Unova para substituir os IDs 1159 e 1157 em sounds/2.',
      historyV4Title: 'NavBGM em português e inglês',
      historyV4Text: 'Alternância de idioma para toda a interface, incluindo instruções e mensagens.',
      historyV3Title: 'Catálogo completo e identidade NavBGM',
      historyV3Text: 'IDs de Hoenn e Unova completados, guia de uso integrado, logo animada com nota musical e nova paleta vermelha.',
      historyV2Title: 'Atualização de MODs', historyV2Text: 'Importação de ZIP/MOD existente, preservação de arquivos, aviso de sobrescrita e aplicação de uma música a vários IDs.',
      historyV1Title: 'Criação de MODs', historyV1Text: 'Geração de info.xml, seleção de faixas, envio de músicas OGG, ícone opcional e exportação em ZIP.', gotIt: 'Entendi',
      noTracks: 'Nenhuma faixa encontrada. Tente outra busca ou informe um ID manualmente.', trackCount: '{visible} faixas documentadas · {modified} já modificadas no MOD',
      selectTrack: 'Selecionar {id}', removeTrack: 'Remover música', replaceOgg: 'Trocar OGG', overwrite: 'Sobrescrever', uploadOgg: '＋ Enviar OGG',
      invalidOgg: 'Envie um MP3 ou um OGG Vorbis válido.', conversionError: 'Não foi possível converter este MP3: {error}', overwriteOne: 'O ID {id} já tem uma música neste MOD. Deseja sobrescrever?',
      exportOriginalTitle: '{count} alteração(ões) preparada(s)', exportTracksTitle: '{count} faixa(s) pronta(s) para o pacote',
      invalidMod: 'Escolha um arquivo .zip ou .mod.', missingInfo: 'Não encontrei o info.xml no pacote.',
      invalidXml: 'O info.xml do MOD não pôde ser lido.', iconStatusImported: '{count} faixa(s) encontrada(s)',
      loadModError: 'Não foi possível abrir esse MOD: {error}',
      overwriteMany: 'Os IDs {ids} já têm músicas neste MOD. Deseja sobrescrever essas faixas?\n\nSe escolher Cancelar, a música será aplicada apenas aos IDs ainda não modificados.',
      downloadTracks: '{file} baixado · {count} faixa(s) incluída(s) ou substituída(s).', downloadEmpty: '{file} baixado.',
      manualIdPlaceholder: 'ID da faixa', manualNamePlaceholder: 'Nome da faixa (opcional)', addTrack: 'Adicionar faixa',
      customTrack: 'Faixa personalizada', duplicateTrackId: 'Este ID já está listado nesta região.', invalidPng: 'O ícone deve estar no formato PNG.',
    },
    en: {
      pageTitle: 'NavBGM — PokéMMO Music Mod Builder', brandTagline: 'POKÉMMO MUSIC BUILDER',
      localStatus: 'runs locally in your browser', languageLabel: 'Language', helpButton: 'How to use',
      introEyebrow: 'NAVBGM · MUSIC MOD BUILDER', introTitle: 'Your soundtrack.<br><em>Your journey.</em>',
      introDescription: 'Build your music selection and prepare a package ready to add to PokéMMO.',
      stepIdentity: 'Details', stepTracks: 'Tracks', stepExport: 'Export', identityTitle: 'MOD details',
      identityDescription: 'This information will appear in the game’s mod manager.', importTitle: 'Already have a MOD?',
      importDescription: 'Upload a .zip or .mod file to add tracks without losing its existing contents.',
      noMod: 'No MOD loaded', openMod: 'Open MOD', defaultModName: 'My Music Mod', modNameLabel: 'MOD name <b>*</b>',
      importStatusLoaded: '{file} · {count} track(s) found',
      modNamePlaceholder: 'e.g. My adventure soundtrack', authorLabel: 'Author <b>*</b>', authorPlaceholder: 'Your name',
      versionLabel: 'Version', descriptionLabel: 'Description', descriptionPlaceholder: 'Tell us a little about your music selection...',
      iconLabel: 'MOD icon <small>OPTIONAL · SQUARE PNG RECOMMENDED</small>', noIcon: 'No icon selected',
      preservedIcon: 'Existing icon will be kept', choosePng: 'Choose PNG', tracksTitle: 'Choose tracks',
      tracksDescription: 'Select a region, find the music, and upload OGG Vorbis or MP3. Conversion requires internet; audio is not uploaded.',
      regionLabel: 'Region', searchPlaceholder: 'Search by track or ID...', manualButton: '＋ Manual ID',
      selectedZero: '0 IDs selected', selectedOne: '1 ID selected', selectedMany: '{count} IDs selected',
      bulkButton: '♫ Apply the same music', clearSelection: 'Clear selection', loadingTracks: 'Loading tracks',
      formatHint: 'Accepted: <b>.ogg</b> and <b>.mp3</b> · local conversion to OGG Vorbis (internet required)', formatHintImported: 'Accepted: <b>.ogg</b> and <b>.mp3</b> · local conversion (internet required); originals kept', convertingAudio: 'Converting to OGG Vorbis…',
      emptyHint: 'Can’t find the track? Use <strong>+ Manual ID</strong>. In game, use <code>/bgm</code> to check the current ID.',
      summaryReady: 'Your package is almost ready', summaryAddTrack: 'Add at least one track to export.',
      summaryPreparedOne: '1 change ready', summaryPreparedMany: '{count} changes ready',
      summaryTrackReadyOne: '1 track ready for the package', summaryTrackReadyMany: '{count} tracks ready for the package',
      summaryKeepOne: 'The loaded MOD will keep its 1 original file along with your changes.',
      summaryKeepMany: 'The loaded MOD will keep its {count} original files along with your changes.',
      summaryZipOne: 'Download the ZIP with 1 OGG file.', summaryZipMany: 'Download the ZIP with {count} OGG files.',
      exportButton: 'Download .ZIP package', privacyNotice: 'Audio stays on your device; the OGG encoder downloads when converting MP3.',
      helpEyebrow: 'QUICK GUIDE', helpTitle: 'How to use NavBGM', closeHelp: 'Close instructions',
      helpStep1Title: 'Create a MOD or open an existing one',
      helpStep1Text: 'Enter a name, author, version, and description. To update a MOD, click <strong>Open MOD</strong> and choose a .zip or .mod file. NavBGM loads its details and keeps the existing files.',
      helpStep2Title: 'Choose a region and track',
      helpStep2Text: 'Select a region, search by name or ID, and upload OGG Vorbis or MP3 (local conversion; internet required). Login screen tracks are in Unova (IDs 1159 and 1157). Tracks already in the MOD are marked; NavBGM asks before replacing them. Use <strong>Manual ID</strong> for tracks missing from the catalog.',
      helpStep3Title: 'Use one song for multiple IDs',
      helpStep3Text: 'Check the tracks you want and choose <strong>Apply the same music</strong>. NavBGM warns you if an ID already exists and lets you replace those tracks or keep the current ones.',
      helpStep4Title: 'Download and install the package',
      helpStep4Text: 'Click <strong>Download .ZIP package</strong> and put the file in <code>PokeMMO/data/mods</code>. Enable the MOD in the game’s mod manager. Audio is processed in your browser and is never sent to a server; the encoder downloads on demand for MP3 conversion.',
      helpTip: '<strong>Tip:</strong> in game, use <code>/bgm</code> to find the ID of the track that is playing. Region folders are Kanto 0, Hoenn 1, Unova 2, Sinnoh 3, and Johto 4.',
      packTitle: 'How the package is built', packDescription: 'This is the structure inside the downloaded ZIP.',
      loginTracksTitle: 'Login screen music', loginTracksDescription: 'These tracks are saved under sounds/2 (Unova).',
      loginTrackMain: 'Login screen', loginTrackAlternative: 'Alternative and uncommon login screen',
      historyTitle: 'Version history', historyV6Title: 'Audio conversion', historyV6Text: 'Upload MP3 and convert it to OGG Vorbis in your browser before packaging.', historyV5Title: 'Login screen music',
      historyV5Text: 'A dedicated Unova section for replacing IDs 1159 and 1157 in sounds/2.',
      historyV4Title: 'NavBGM in Portuguese and English',
      historyV4Text: 'Switch languages across the interface, including help and messages.',
      historyV3Title: 'Complete catalog and NavBGM identity',
      historyV3Text: 'Added missing Hoenn and Unova IDs, an in-app guide, an animated Poké Ball music logo, and a red color palette.',
      historyV2Title: 'MOD updates', historyV2Text: 'Import existing ZIP/MOD files, preserve their contents, confirm overwrites, and apply one song to multiple IDs.',
      historyV1Title: 'MOD creation', historyV1Text: 'Generate info.xml, choose tracks, upload OGG music, add an optional icon, and export as ZIP.', gotIt: 'Got it',
      noTracks: 'No tracks found. Try another search or enter an ID manually.', trackCount: '{visible} documented tracks · {modified} already changed in this MOD',
      selectTrack: 'Select {id}', removeTrack: 'Remove music', replaceOgg: 'Replace OGG', overwrite: 'Overwrite', uploadOgg: '＋ Upload OGG',
      invalidOgg: 'Upload an MP3 or a valid OGG Vorbis file.', conversionError: 'Could not convert this MP3: {error}', overwriteOne: 'ID {id} already has music in this MOD. Do you want to overwrite it?',
      exportOriginalTitle: '{count} change(s) ready', exportTracksTitle: '{count} track(s) ready for the package',
      invalidMod: 'Choose a .zip or .mod file.', missingInfo: 'Could not find info.xml in the package.',
      invalidXml: 'Could not read this MOD’s info.xml.', iconStatusImported: '{count} track(s) found',
      loadModError: 'Could not open this MOD: {error}',
      overwriteMany: 'IDs {ids} already have music in this MOD. Do you want to overwrite those tracks?\n\nIf you choose Cancel, the song will only be applied to IDs that have not been changed yet.',
      downloadTracks: '{file} downloaded · {count} track(s) added or replaced.', downloadEmpty: '{file} downloaded.',
      manualIdPlaceholder: 'Track ID', manualNamePlaceholder: 'Track name (optional)', addTrack: 'Add track',
      customTrack: 'Custom track', duplicateTrackId: 'This ID is already listed in this region.', invalidPng: 'The icon must be a PNG file.',
    },
  };
  let language = 'pt';
  let importedModName = '';

  function t(key, values = {}) {
    return (translations[language][key] || translations.pt[key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  }

  function applyLanguage(nextLanguage) {
    const manualRow = $('trackList')?.querySelector('.manual-row');
    const manualValues = manualRow
      ? [...manualRow.querySelectorAll('input')].map((input) => input.value)
      : null;

    language = nextLanguage === 'en' ? 'en' : 'pt';
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR';
    document.title = t('pageTitle');
    $('languageSelect').value = language;
    if (['Meu MOD de Música', 'My Music Mod'].includes($('modName').value)) {
      $('modName').value = t('defaultModName');
    }

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach((element) => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
    });

    $('importStatus').textContent = importedModName
      ? t('importStatusLoaded', { file: importedModName, count: existingTracks.size })
      : t('noMod');
    $('iconStatus').textContent = iconFile?.name || (originalIcon ? t('preservedIcon') : t('noIcon'));
    $('formatHint').innerHTML = t(originalFileCount ? 'formatHintImported' : 'formatHint');
    updateSummary();
    render();
    if (manualValues) {
      addManualTrack();
      $('trackList').querySelectorAll('.manual-row input').forEach((input, index) => {
        input.value = manualValues[index] || '';
      });
    }
  }

  function key(id, regionId = region.value) {
    return `${regionId}:${id}`;
  }

  function trackName(id, name) {
    if (region.value !== '2') return name;
    if (String(id) === '1159') return t('loginTrackMain');
    if (String(id) === '1157') return t('loginTrackAlternative');
    return name;
  }

  function esc(value) { // escapa & < > " ' nos nomes de arquivo antes de jogar no innerHTML
    return String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
    }[c]));
  }

  function visibleTracks() {
    const rows = [...(window.TRACKS[region.value] || []), ...extras[region.value]];
    const query = $('search').value.trim().toLocaleLowerCase(language === 'pt' ? 'pt-BR' : 'en');
    if (!query) return rows;
    return rows.filter(([id, name]) =>
      String(id).includes(query) || trackName(id, name).toLocaleLowerCase(language === 'pt' ? 'pt-BR' : 'en').includes(query)
    );
  }

  function render() {
    const tracks = visibleTracks();
    const modifiedInRegion = [...existingTracks.keys()].filter((k) => k.startsWith(`${region.value}:`)).length;

    $('trackCount').textContent = t('trackCount', { visible: tracks.length, modified: modifiedInRegion });
    $('bulkBar').hidden = selectedIds.size === 0;
    $('selectedCount').textContent = selectedIds.size === 0
      ? t('selectedZero')
      : selectedIds.size === 1 ? t('selectedOne') : t('selectedMany', { count: selectedIds.size });

    if (!tracks.length) {
      $('trackList').innerHTML = `<div class="empty-state">${t('noTracks')}</div>`;
      updateSummary();
      return;
    }

    const renderTrack = ([id, name]) => {
      const k = key(id);
      const chosenFile = chosen.get(k);
      const isExisting = existingTracks.has(k);
      const inputId = `upload-${region.value}-${id}`;
      const displayName = trackName(id, name);

      return `
        <div class="track-row ${chosenFile ? 'has-file' : ''} ${isExisting ? 'already-modified' : ''}" data-track="${esc(id)}">
          <input class="track-check" type="checkbox" aria-label="${t('selectTrack', { id: esc(id) })}" data-id="${esc(id)}" ${selectedIds.has(k) ? 'checked' : ''}>
          <span class="track-id">${esc(id)}</span>
          <span class="track-name" title="${esc(displayName)}">${esc(displayName)}${isExisting ? '<small class="modified-badge">NO MOD</small>' : ''}</span>
          <div class="track-upload">
            ${chosenFile ? `<span class="file-name" title="${esc(chosenFile.name)}">${esc(chosenFile.name)}</span><span class="dest-path">→ sounds/${esc(region.value)}/${esc(id)}.ogg</span><button class="file-button remove-file" type="button" data-id="${esc(id)}" aria-label="${t('removeTrack')}">${t('removeTrack')}</button>` : ''}
            <label class="file-button" for="${inputId}">${chosenFile ? t('replaceOgg') : isExisting ? t('overwrite') : t('uploadOgg')}</label>
            <input class="ogg-input" id="${inputId}" data-id="${esc(id)}" type="file" accept=".ogg,.mp3,audio/ogg,audio/mpeg" hidden>
          </div>
        </div>`;
    };
    const loginTrackIds = new Set(['1157', '1159']);
    const loginTracks = region.value === '2' ? tracks.filter(([id]) => loginTrackIds.has(String(id))) : [];
    const regularTracks = loginTracks.length ? tracks.filter(([id]) => !loginTrackIds.has(String(id))) : tracks;
    const loginGroup = loginTracks.length
      ? `<div class="track-group-heading"><strong>${t('loginTracksTitle')}</strong><span>${t('loginTracksDescription')}</span></div>${loginTracks.map(renderTrack).join('')}`
      : '';

    $('trackList').innerHTML = `${loginGroup}${regularTracks.map(renderTrack).join('')}`;

    $('trackList').querySelectorAll('.ogg-input').forEach(input => input.addEventListener('change', onOgg));
    $('trackList').querySelectorAll('.remove-file').forEach((button) => {
      button.addEventListener('click', () => {
        chosen.delete(key(button.dataset.id));
        render();
      });
    });
    $('trackList').querySelectorAll('.track-check').forEach((box) => {
      box.addEventListener('change', () => {
        const k = key(box.dataset.id);
        if (box.checked) selectedIds.add(k); else selectedIds.delete(k);
        render();
      });
    });

    updateSummary();
  }

  async function loadVorbisEncoder() {
    if (!encoderScript) {
      encoderScript = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/wasm-media-encoders@0.7.0/dist/umd/WasmMediaEncoder.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Encoder download failed'));
        document.head.append(script);
      });
    }
    await encoderScript;
    return window.WasmMediaEncoder.createOggEncoder();
  }

  async function prepareAudio(file) {
    if (!file) return null;
    const data = new Uint8Array(await file.slice(0, 4).arrayBuffer());
    const header = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    const headerText = String.fromCharCode(...header);
    const isOgg = headerText.startsWith('OggS') && headerText.includes('\x01vorbis');
    const isMp3 = data.length >= 3 && ((data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33)
      || (data[0] === 0xff && (data[1] & 0xe0) === 0xe0));
    if (isOgg) return file;
    if (!isMp3) throw new Error(t('invalidOgg'));

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error(t('invalidOgg'));
    const context = new AudioContextClass();
    try {
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      const channels = Math.min(buffer.numberOfChannels, 2);
      const encoder = await loadVorbisEncoder();
      encoder.configure({ sampleRate: buffer.sampleRate, channels, vbrQuality: 4 });
      const chunks = [];
      const chunkSize = 16384;
      for (let start = 0; start < buffer.length; start += chunkSize) {
        const end = Math.min(start + chunkSize, buffer.length);
        const pcm = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel).subarray(start, end));
        const part = encoder.encode(pcm);
        if (part.length) chunks.push(new Uint8Array(part));
      }
      const last = encoder.finalize();
      if (last.length) chunks.push(new Uint8Array(last));
      if (!chunks.length || String.fromCharCode(...chunks[0].subarray(0, 4)) !== 'OggS') throw new Error(t('invalidOgg'));
      const name = file.name.replace(/\.[^.]+$/, '') + '.ogg';
      return new File(chunks, name, { type: 'audio/ogg' });
    } finally {
      await context.close();
    }
  }

  async function onOgg(event) {
    const file = event.target.files[0];
    if (!file) return;

    const id = event.target.dataset.id;
    const k = key(id);
    if (existingTracks.has(k) && !confirm(t('overwriteOne', { id }))) {
      event.target.value = '';
      return;
    }
    audioBusy = true;
    $('formatHint').textContent = t('convertingAudio');
    updateSummary();
    try {
      const prepared = await prepareAudio(file);
      if (prepared) chosen.set(k, prepared);
      render();
    } catch (error) {
      alert(t('conversionError', { error: error.message }));
    } finally {
      audioBusy = false;
      $('formatHint').innerHTML = t(importedModName ? 'formatHintImported' : 'formatHint');
      updateSummary();
      event.target.value = '';
    }
  }

  function updateSummary() {
    const n = chosen.size;
    const original = originalFileCount;

    $('summaryTitle').textContent = original
      ? n === 1 ? t('summaryPreparedOne') : t('summaryPreparedMany', { count: n })
      : n ? n === 1 ? t('summaryTrackReadyOne') : t('summaryTrackReadyMany', { count: n }) : t('summaryReady');

    $('summaryText').textContent = original
      ? original === 1 ? t('summaryKeepOne') : t('summaryKeepMany', { count: original })
      : n ? n === 1 ? t('summaryZipOne') : t('summaryZipMany', { count: n }) : t('summaryAddTrack');

    $('exportButton').disabled = audioBusy || (n === 0 && original === 0)
      || !$('modName').value.trim()
      || !$('author').value.trim()
      || !$('version').value.trim();
  }

  function xml() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<resource name="${esc($('modName').value.trim())}" version="${esc($('version').value.trim())}" description="${esc($('description').value.trim())}" author="${esc($('author').value.trim())}">
</resource>
`;
  }

  async function openMod(file) {
    if (!file) return;
    if (!/\.(zip|mod)$/i.test(file.name)) {
      alert(t('invalidMod'));
      return;
    }

    try {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter((entry) => !entry.dir);
      const infoEntry = entries.find((entry) => entry.name.split('/').at(-1).toLowerCase() === 'info.xml');
      if (!infoEntry) throw new Error(t('missingInfo'));

      const prefix = infoEntry.name.slice(0, infoEntry.name.lastIndexOf('/') + 1);
      const xmlText = await infoEntry.async('text');
      const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
      const resource = doc.querySelector('resource');
      if (!resource || doc.querySelector('parsererror')) throw new Error(t('invalidXml'));

      baseFiles.clear(); // tem que limpar tudo aqui, senão mistura com o MOD carregado antes

      existingTracks.clear();
      chosen.clear();
      selectedIds.clear();
      originalFileCount = 0;
      originalIcon = null;
      iconFile = null;

      for (const entry of entries) {
        if (!entry.name.startsWith(prefix)) continue;
        const path = entry.name.slice(prefix.length);
        if (!path || path.toLowerCase() === 'info.xml') continue;

        baseFiles.set(path, entry);
        originalFileCount++;
        if (path.toLowerCase() === 'icon.png') originalIcon = entry;

        const match = path.match(/^sounds\/([0-4])\/(\d+)\.(ogg|mp3|wav)$/i);
        if (match) existingTracks.set(key(match[2], match[1]), path);
      }

      $('modName').value = resource.getAttribute('name') || file.name.replace(/\.(zip|mod)$/i, '');
      $('version').value = resource.getAttribute('version') || '1.0';
      $('author').value = resource.getAttribute('author') || '';
      $('description').value = resource.getAttribute('description') || '';
      importedModName = file.name;
      $('iconStatus').textContent = originalIcon ? t('preservedIcon') : t('noIcon');
      $('importStatus').textContent = t('importStatusLoaded', { file: file.name, count: existingTracks.size });
      $('formatHint').innerHTML = t('formatHintImported');
      render();
    } catch (error) {
      alert(t('loadModError', { error: error.message }));
    }
  }

  async function applyToSelected(file) {
    if (!file || !selectedIds.size) return;

    const conflicts = [...selectedIds].filter((k) => existingTracks.has(k));
    let overwrite = false;
    if (conflicts.length) {
      const names = conflicts.map((k) => k.split(':')[1]).join(', ');
      overwrite = confirm(t('overwriteMany', { ids: names }));
    }

    audioBusy = true;
    $('formatHint').textContent = t('convertingAudio');
    updateSummary();
    try {
      const prepared = await prepareAudio(file);
      if (!prepared) return;
      for (const k of selectedIds) {
        if (!existingTracks.has(k) || overwrite) chosen.set(k, prepared);
      }
      selectedIds.clear();
      render();
    } catch (error) {
      alert(t('conversionError', { error: error.message }));
    } finally {
      audioBusy = false;
      $('formatHint').innerHTML = t(importedModName ? 'formatHintImported' : 'formatHint');
      updateSummary();
    }
  }

  async function saveMod() {
    if (!chosen.size && !baseFiles.size) return;

    const zip = new JSZip();

    // copia o conteúdo original do MOD, pulando o que vai ser substituído
    for (const [path, entry] of baseFiles) {
      const match = path.match(/^sounds\/([0-4])\/(\d+)\.(ogg|mp3|wav)$/i);
      if (match && chosen.has(key(match[2], match[1]))) continue;
      zip.file(path, await entry.async('uint8array'));
    }

    zip.file('info.xml', encoder.encode(xml()));
    if (iconFile) zip.file('icon.png', await iconFile.arrayBuffer());

    for (const [trackKey, file] of chosen) {
      const [regionId, id] = trackKey.split(':');
      zip.file(`sounds/${regionId}/${id}.ogg`, await file.arrayBuffer());
    }

    // STORE em vez de DEFLATE pq ogg já vem comprimido, comprimir de novo só demora mais e não ganha nada
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const fileBase = $('modName').value.trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
      .replace(/[. ]+$/, '') || 'meu-mod';
    a.download = `${fileBase}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);

    const previousText = $('summaryText').textContent;
    $('summaryText').textContent = chosen.size
      ? t('downloadTracks', { file: `${fileBase}.zip`, count: chosen.size })
      : t('downloadEmpty', { file: `${fileBase}.zip` });
    setTimeout(() => { $('summaryText').textContent = previousText; }, 4000);
  }

  function addManualTrack() {
    if ($('trackList').querySelector('.manual-row')) return;

    const row = document.createElement('div');
    row.className = 'manual-row';
    row.innerHTML = `<input type="number" min="0" max="99999" placeholder="${t('manualIdPlaceholder')}" aria-label="${t('manualIdPlaceholder')}"><input type="text" maxlength="100" placeholder="${t('manualNamePlaceholder')}" aria-label="${t('manualNamePlaceholder')}"><button type="button">${t('addTrack')}</button>`;
    $('trackList').prepend(row);
    row.querySelector('input').focus();

    row.querySelector('button').addEventListener('click', () => {
      const idInput = row.querySelector('input');
      const id = idInput.value.trim();
      const name = row.querySelectorAll('input')[1].value.trim() || t('customTrack');

      if (!/^\d{1,5}$/.test(id)) {
        idInput.focus();
        return;
      }
      const alreadyListed = [...(window.TRACKS[region.value] || []), ...extras[region.value]]
        .some((track) => String(track[0]) === id);
      if (alreadyListed) {
        idInput.setCustomValidity(t('duplicateTrackId'));
        idInput.reportValidity();
        return;
      }

      extras[region.value].push([id, name]);
      $('search').value = '';
      render();
    });
  }

  region.addEventListener('change', render);
  $('search').addEventListener('input', render);
  $('manualButton').addEventListener('click', addManualTrack);
  $('exportButton').addEventListener('click', saveMod);
  $('helpButton').addEventListener('click', () => $('helpDialog').showModal());
  $('closeHelp').addEventListener('click', () => $('helpDialog').close());
  $('gotIt').addEventListener('click', () => $('helpDialog').close());
  $('modFile').addEventListener('change', (event) => openMod(event.target.files[0]));
  $('bulkUploadButton').addEventListener('click', () => $('bulkFile').click());
  $('bulkFile').addEventListener('change', (event) => {
    applyToSelected(event.target.files[0]);
    event.target.value = '';
  });
  $('clearSelection').addEventListener('click', () => { selectedIds.clear(); render(); });
  $('languageSelect').addEventListener('change', (event) => {
    language = event.target.value === 'en' ? 'en' : 'pt';
    try { localStorage.setItem('navbgm-language', language); } catch (error) { /* storage can be disabled */ }
    applyLanguage(language);
  });
  ['modName', 'author', 'version'].forEach((id) => $(id).addEventListener('input', updateSummary));
  $('iconFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.png')) {
      alert(t('invalidPng'));
      event.target.value = '';
      return;
    }
    iconFile = file;
    $('iconStatus').textContent = file.name;
  });

  try {
    language = localStorage.getItem('navbgm-language') === 'en' ? 'en' : 'pt';
  } catch (error) { language = 'pt'; }
  applyLanguage(language);
})();
