(() => {
  const regions = {0:'Kanto',1:'Hoenn',2:'Unova',3:'Sinnoh',4:'Johto'};
  const chosen = new Map();       // new OGG files keyed by region:track ID
  const existingTracks = new Map(); // region:track ID -> original ZIP path
  const baseFiles = new Map();    // original ZIP files preserved on export
  const selectedIds = new Set();
  const extras = {0:[],1:[],2:[],3:[],4:[]};
  const $ = id => document.getElementById(id);
  let iconFile = null;
  let originalIcon = null;
  let originalFileCount = 0;
  const region = $('region');
  const encoder = new TextEncoder();

  function key(id, regionId=region.value) { return `${regionId}:${id}`; }
  function safeText(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])); }
  function visibleTracks() {
    const rows = [...(window.TRACKS[region.value] || []), ...extras[region.value]];
    const query = $('search').value.trim().toLocaleLowerCase('pt-BR');
    return rows.filter(([id,name]) => !query || String(id).includes(query) || name.toLocaleLowerCase('pt-BR').includes(query));
  }
  function render() {
    const tracks = visibleTracks();
    $('trackCount').textContent = `${tracks.length} faixas documentadas · ${[...existingTracks.keys()].filter(k=>k.startsWith(`${region.value}:`)).length} já modificadas no MOD`;
    $('bulkBar').hidden = selectedIds.size === 0;
    $('selectedCount').textContent = `${selectedIds.size} ${selectedIds.size === 1 ? 'ID selecionado' : 'IDs selecionados'}`;
    if (!tracks.length) {
      $('trackList').innerHTML = '<div class="empty-state">Nenhuma faixa encontrada. Tente outra busca ou informe um ID manualmente.</div>';
      updateSummary(); return;
    }
    $('trackList').innerHTML = tracks.map(([id,name]) => {
      const k = key(id), chosenFile = chosen.get(k), isExisting = existingTracks.has(k);
      const inputId = `upload-${region.value}-${id}`;
      return `<div class="track-row ${chosenFile ? 'has-file' : ''} ${isExisting ? 'already-modified' : ''}" data-track="${safeText(id)}">
        <input class="track-check" type="checkbox" aria-label="Selecionar ${safeText(id)}" data-id="${safeText(id)}" ${selectedIds.has(k)?'checked':''}>
        <span class="track-id">${safeText(id)}</span><span class="track-name" title="${safeText(name)}">${safeText(name)}${isExisting?'<small class="modified-badge">NO MOD</small>':''}</span>
        <div class="track-upload">${chosenFile ? `<span class="file-name" title="${safeText(chosenFile.name)}">${safeText(chosenFile.name)}</span><button class="file-button remove-file" type="button" data-id="${safeText(id)}" aria-label="Remover música">Remover</button>` : ''}
          <label class="file-button" for="${inputId}">${chosenFile ? 'Trocar OGG' : isExisting ? 'Sobrescrever' : '＋ Enviar OGG'}</label><input class="ogg-input" id="${inputId}" data-id="${safeText(id)}" type="file" accept=".ogg,audio/ogg" hidden>
        </div></div>`;
    }).join('');
    $('trackList').querySelectorAll('.ogg-input').forEach(input => input.addEventListener('change', onOgg));
    $('trackList').querySelectorAll('.remove-file').forEach(button => button.addEventListener('click', () => { chosen.delete(key(button.dataset.id)); render(); }));
    $('trackList').querySelectorAll('.track-check').forEach(box => box.addEventListener('change', () => {
      const k=key(box.dataset.id); if(box.checked) selectedIds.add(k); else selectedIds.delete(k); render();
    }));
    updateSummary();
  }
  function validOgg(file) {
    if (file && !file.name.toLowerCase().endsWith('.ogg')) { alert('Escolha um arquivo com extensão .ogg.'); return false; }
    return !!file;
  }
  function onOgg(event) {
    const file = event.target.files[0]; if (!validOgg(file)) return;
    const id=event.target.dataset.id, k=key(id);
    if (existingTracks.has(k) && !confirm(`O ID ${id} já tem uma música neste MOD. Deseja sobrescrever?`)) { event.target.value=''; return; }
    chosen.set(k,file); render();
  }
  function updateSummary() {
    const n = chosen.size, original = originalFileCount;
    $('summaryTitle').textContent = original ? `${n} ${n === 1 ? 'alteração preparada' : 'alterações preparadas'}` : n ? `${n} ${n === 1 ? 'faixa pronta' : 'faixas prontas'} para o pacote` : 'Seu pacote está quase pronto';
    $('summaryText').textContent = original ? `O MOD carregado será preservado com ${original} arquivo${original === 1 ? '' : 's'} original${original === 1 ? '' : 'is'} e suas alterações.` : n ? `Baixe o ZIP com ${n} arquivo${n === 1 ? '' : 's'} OGG.` : 'Envie um OGG para pelo menos uma faixa.';
    $('exportButton').disabled = (n === 0 && original === 0) || !$('modName').value.trim() || !$('author').value.trim() || !$('version').value.trim();
  }
  function xml() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<resource name="${safeText($('modName').value.trim())}" version="${safeText($('version').value.trim())}" description="${safeText($('description').value.trim())}" author="${safeText($('author').value.trim())}">\n</resource>\n`;
  }
  async function loadMod(file) {
    if (!file) return;
    if (!/\.(zip|mod)$/i.test(file.name)) { alert('Escolha um arquivo .zip ou .mod.'); return; }
    try {
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter(entry=>!entry.dir);
      const infoEntry = entries.find(entry=>entry.name.split('/').at(-1).toLowerCase()==='info.xml');
      if (!infoEntry) throw new Error('Não encontrei o info.xml no pacote.');
      const prefix=infoEntry.name.slice(0,infoEntry.name.lastIndexOf('/')+1);
      const xmlText=await infoEntry.async('text');
      const doc=new DOMParser().parseFromString(xmlText,'application/xml');
      const resource=doc.querySelector('resource');
      if (!resource || doc.querySelector('parsererror')) throw new Error('O info.xml do MOD não pôde ser lido.');

      baseFiles.clear(); existingTracks.clear(); chosen.clear(); selectedIds.clear(); originalFileCount=0; originalIcon=null; iconFile=null;
      for (const entry of entries) {
        if (!entry.name.startsWith(prefix)) continue;
        const path=entry.name.slice(prefix.length);
        if (!path || path.toLowerCase()==='info.xml') continue;
        baseFiles.set(path,entry); originalFileCount++;
        if (path.toLowerCase()==='icon.png') originalIcon=entry;
        const match=path.match(/^sounds\/([0-4])\/(\d+)\.(ogg|mp3|wav)$/i);
        if (match) existingTracks.set(key(match[2],match[1]),path);
      }
      $('modName').value=resource.getAttribute('name')||file.name.replace(/\.(zip|mod)$/i,'');
      $('version').value=resource.getAttribute('version')||'1.0';
      $('author').value=resource.getAttribute('author')||'';
      $('description').value=resource.getAttribute('description')||'';
      $('iconStatus').textContent=originalIcon?'Ícone existente será preservado':'Nenhum ícone no MOD';
      $('importStatus').textContent=`${file.name} · ${existingTracks.size} faixa(s) encontrada(s)`;
      $('formatHint').innerHTML='Formato aceito: <b>.ogg</b> · arquivos originais serão mantidos';
      render();
    } catch (error) {
      alert(`Não foi possível abrir esse MOD: ${error.message}`);
    }
  }
  async function applyBulkFile(file) {
    if (!validOgg(file)) return;
    const conflicts=[...selectedIds].filter(k=>existingTracks.has(k));
    let overwrite=false;
    if (conflicts.length) {
      const names=conflicts.map(k=>k.split(':')[1]).join(', ');
      overwrite=confirm(`Os IDs ${names} já têm músicas neste MOD. Deseja sobrescrever essas faixas?\n\nSe escolher Cancelar, a música será aplicada apenas aos IDs ainda não modificados.`);
    }
    for (const k of selectedIds) if (!existingTracks.has(k) || overwrite) chosen.set(k,file);
    selectedIds.clear(); render();
  }
  async function exportZip() {
    if (!chosen.size && !baseFiles.size) return;
    const zip=new JSZip();
    for (const [path,entry] of baseFiles) {
      const match=path.match(/^sounds\/([0-4])\/(\d+)\.(ogg|mp3|wav)$/i);
      if (match && chosen.has(key(match[2],match[1]))) continue;
      zip.file(path,await entry.async('uint8array'));
    }
    zip.file('info.xml',encoder.encode(xml()));
    if (iconFile) zip.file('icon.png',await iconFile.arrayBuffer());
    for (const [trackKey,file] of chosen) {
      const [regionId,id]=trackKey.split(':');
      zip.file(`sounds/${regionId}/${id}.ogg`,await file.arrayBuffer());
    }
    const blob=await zip.generateAsync({type:'blob',compression:'STORE'}), a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    const fileBase=$('modName').value.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/[. ]+$/,'')||'meu-mod';
    a.download=`${fileBase}.zip`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500);
  }
  function addManualRow() {
    if ($('trackList').querySelector('.manual-row')) return;
    const row=document.createElement('div'); row.className='manual-row';
    row.innerHTML='<input type="number" min="0" max="99999" placeholder="ID da faixa" aria-label="ID da faixa"><input type="text" maxlength="100" placeholder="Nome da faixa (opcional)" aria-label="Nome da faixa"><button type="button">Adicionar faixa</button>';
    $('trackList').prepend(row); row.querySelector('input').focus();
    row.querySelector('button').addEventListener('click',()=>{
      const id=row.querySelector('input').value.trim(), name=row.querySelectorAll('input')[1].value.trim()||'Faixa personalizada';
      if (!/^\d{1,5}$/.test(id)) { row.querySelector('input').focus(); return; }
      if ([...(window.TRACKS[region.value]||[]),...extras[region.value]].some(track=>String(track[0])===id)) { row.querySelector('input').setCustomValidity('Este ID já está listado nesta região.'); row.querySelector('input').reportValidity(); return; }
      extras[region.value].push([id,name]); $('search').value=''; render();
    });
  }

  region.addEventListener('change',render); $('search').addEventListener('input',render);
  $('manualButton').addEventListener('click',addManualRow); $('exportButton').addEventListener('click',exportZip);
  $('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
  $('closeHelp').addEventListener('click',()=>$('helpDialog').close());
  $('gotIt').addEventListener('click',()=>$('helpDialog').close());
  $('modFile').addEventListener('change',event=>loadMod(event.target.files[0]));
  $('bulkUploadButton').addEventListener('click',()=>$('bulkFile').click());
  $('bulkFile').addEventListener('change',event=>{applyBulkFile(event.target.files[0]); event.target.value='';});
  $('clearSelection').addEventListener('click',()=>{selectedIds.clear();render();});
  ['modName','author','version'].forEach(id=>$(id).addEventListener('input',updateSummary));
  $('iconFile').addEventListener('change',event=>{
    const file=event.target.files[0]; if (!file) return;
    if (!file.name.toLowerCase().endsWith('.png')) { alert('O ícone deve estar no formato PNG.'); event.target.value=''; return; }
    iconFile=file; $('iconStatus').textContent=file.name;
  });
  render();
})();
