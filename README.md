# NavBGM — Criador de MODs de música para PokéMMO

Aplicação estática que roda no navegador para criar ou atualizar pacotes ZIP de MODs musicais. Não precisa de servidor próprio.

## Como usar

1. Abra `index.html` em um navegador atualizado e use **Como usar** para ver as instruções na própria tela.
2. Preencha nome, autor, versão e descrição. O ícone PNG é opcional.
3. Para atualizar um MOD, escolha **Abrir MOD** e selecione um `.zip` ou `.mod`. O NavBGM carrega os metadados e mantém os arquivos que não forem substituídos.
4. Escolha a região, pesquise uma faixa e anexe um arquivo `.ogg`. Se o ID já estiver no pacote, confirme antes de sobrescrevê-lo.
5. Para repetir uma mesma música em várias faixas, marque as caixas dos IDs e clique em **Aplicar a mesma música**.
6. Baixe o ZIP. O conteúdo inclui `info.xml` e os arquivos na estrutura `sounds/<região>/<ID>.ogg`.

No jogo, `/bgm` mostra o ID que está tocando. As pastas regionais são Kanto 0, Hoenn 1, Unova 2, Sinnoh 3 e Johto 4.

## Histórico de versões

- **V3:** IDs de Hoenn e Unova completados, guia de uso integrado, identidade NavBGM com Pokébola animada e paleta vermelha.
- **V2:** importação e atualização de ZIP/MOD, preservação dos arquivos, confirmação de sobrescrita e envio de uma música para vários IDs.
- **V1:** criação de `info.xml`, seleção de faixas, upload de OGG, ícone opcional e exportação em ZIP.

## Catálogo

Os catálogos de Kanto, Hoenn, Unova e Johto incluem os IDs da lista comunitária fornecida para o projeto. Sinnoh usa o mapeamento de `../Docs/pokemmo_sinnoh_trilhas.xlsx`.

## Arquivos que devem ser publicados juntos

```text
index.html
style.css
app.js
tracks.js
tracks-community.js
tracks-sinnoh.js
assets/pokeball_spin.gif
vendor/jszip.min.js
vendor/LICENSE-jszip.markdown
```

`vendor/jszip.min.js` permite ler e atualizar pacotes existentes sem enviar os arquivos para um servidor. Os arquivos escolhidos pelo usuário são processados no próprio navegador.

## Publicar no GitHub Pages

1. Crie um repositório e envie os arquivos listados acima, incluindo `assets` e `vendor`.
2. Abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, selecione `main` e a pasta `/ (root)`.
4. Salve e aguarde o endereço do site aparecer nas configurações do Pages.
