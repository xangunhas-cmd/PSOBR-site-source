# Bot do Discord — PSO Brasil

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
