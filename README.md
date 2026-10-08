# NavBGM — criador de MODs de música para PokéMMO

Comecei o NavBGM porque montar um MOD de música na mão era repetitivo: renomear as faixas, escrever o `info.xml` e conferir se o ZIP estava com as pastas certas. A ferramenta cuida dessa parte e também ajuda a atualizar um MOD que já existe.

Tudo acontece no navegador. Não tem servidor, não envia seus arquivos para outro lugar e não é um editor de áudio: você escolhe os OGGs e o NavBGM organiza o pacote.

A interface pode ser usada em português ou inglês. É só trocar o idioma no topo da página.

## Problemas conhecidos

- O regex que lê um MOD importado aceita `.ogg`, `.mp3` e `.wav`, mas o upload só valida
  `.ogg` — então se você importar um MOD com faixa em mp3, o NavBGM mostra ela como "já
  modificada" mas não deixa trocar por outro mp3 direto (precisa ser ogg). Ainda não
  mexi nisso.
- Alguns MODs mais antigos guardam os arquivos em caminhos fora do padrão
  `sounds/<região>/<id>.ogg` — esses simplesmente não aparecem como faixa reconhecida,
  mas continuam preservados no ZIP de saída.
- Dependendo de como o `.zip` foi gerado (tem programa que usa caminho com `\` em vez de
  `/`), o NavBGM pode não achar o `info.xml`. Não vi isso acontecer com ZIPs feitos pelo
  próprio app ou por ferramentas comuns, só mencionando por garantia.

## Próximos passos

- [x] Importar e atualizar um MOD existente sem perder conteúdo
- [x] Aplicar a mesma música a vários IDs de uma vez
- [x] Catálogo com IDs de Kanto, Hoenn, Unova, Sinnoh e Johto
- [ ] Suporte de upload para mp3/wav, já que o import já reconhece esses formatos
- [ ] Algum jeito de pré-ouvir o OGG antes de confirmar o upload

## Como usar

1. Abra `index.html` num navegador atualizado e, se precisar, use o botão **Como usar**.
2. Preencha os dados do MOD e escolha um ícone, se quiser.
3. Para atualizar um pacote, clique em **Abrir MOD** e selecione o `.zip` ou `.mod`.
4. Escolha uma região e envie um arquivo `.ogg`. O app pergunta antes de sobrescrever uma faixa.
5. Você também pode marcar vários IDs para aplicar a mesma música a todos eles.
6. Baixe o ZIP e coloque-o na pasta de mods do jogo.

No jogo, `/bgm` mostra o ID da faixa que está tocando. As regiões usam as pastas Kanto 0, Hoenn 1, Unova 2, Sinnoh 3 e Johto 4.

## Catálogo

Kanto, Hoenn, Unova e Johto vêm de listas da comunidade e podem ter lacunas. Dá para adicionar IDs manualmente no próprio app. O catálogo de Sinnoh foi montado a partir de uma planilha própria.

## Desenvolvimento

Usei IA como apoio em alguns trechos e na revisão de código, principalmente para agilizar partes repetitivas. As decisões do projeto, o catálogo e o fluxo de uso foram definidos por mim.

## Rodar e publicar

Os arquivos do app precisam continuar juntos: `index.html`, `style.css`, `app.js`, os três arquivos `tracks*.js`, `assets/` e `vendor/`.

Para publicar no GitHub Pages, envie esses arquivos para a raiz do repositório e selecione **Settings → Pages → Deploy from a branch → main → /(root)**.
