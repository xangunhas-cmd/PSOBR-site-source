# Bot do Discord — PSO Brasil

## Integração direta com a base do bot

O site lê diretamente o registro `global` da tabela `pso_bot_state` na base D1 vinculada como `DB`. O estado completo permanece no servidor; somente jogadores, imagens públicas, clubes e movimentações necessárias são usados nas páginas.

Não são necessários `PSO_API_URL`, `PSO_API_KEY` ou `PSO_GUILD_ID`. O bot também não precisa estar ligado para o site consultar o último estado salvo na base.

O site publica transferências, demissões e contratos encerrados. O nickname é cruzado com `lib/catalog.ts`; quando uma transferência encontra uma carta com overall 84 ou maior, ela também aparece automaticamente em Notícias com a imagem da carta. Caso não exista carta, a foto pública de registro do jogador é usada.

O bot completo recebe comandos pelo Gateway do Discord. Ao migrar para ele, remova o Interactions Endpoint URL da aplicação anterior ou use uma aplicação Discord separada, para evitar que os comandos sejam desviados para o endpoint antigo do site.

## Integração anterior (legado)

O bot usa comandos do Discord recebidos diretamente pelo site. Assim, não é necessário deixar um computador ou um processo do bot ligado 24 horas.

## Comandos preparados

- `/transferencia jogador overall origem destino posicao`
  - publica o movimento em **Transferências**;
  - se o overall for **84 ou maior**, também cria uma chamada automática em **Notícias**.
- `/noticia tipo titulo resumo link`
  - publica **Comunicado** ou **Título** em Notícias.

Os comandos ficam restritos, por padrão, a quem possui a permissão **Gerenciar Servidor**. Também é possível definir cargos específicos com `DISCORD_ADMIN_ROLE_IDS`.

## O que falta configurar

1. Criar uma aplicação em <https://discord.com/developers/applications>.
2. Na aplicação, copiar os valores **Application ID** e **Public Key**.
3. Criar o Bot e guardar o **Bot Token** como segredo. Nunca publicar esse token em mensagem, arquivo ou repositório.
4. Instalar a aplicação no servidor PSO Brasil com os escopos `bot` e `applications.commands`.
5. Depois que o site estiver publicado na conta correta, informar no Discord Developer Portal o endpoint:

   `https://ENDERECO-DO-SITE/api/discord/interactions`

6. Configurar `DISCORD_PUBLIC_KEY` e, opcionalmente, `DISCORD_ADMIN_ROLE_IDS` nas variáveis do Site.
7. No computador do responsável, executar `npm run discord:register:secure`, colar o token no campo oculto e aguardar a confirmação. O token existe somente durante esse comando e é removido em seguida.

## Dados persistidos

O banco D1 guarda jogador, posição, overall, clube de origem, clube de destino, data, autor e referência do canal do Discord. Notícias oficiais guardam tipo, título, resumo, data, link e autor.

As tabelas são criadas pela migração em `drizzle/0000_sturdy_misty_knight.sql`.
