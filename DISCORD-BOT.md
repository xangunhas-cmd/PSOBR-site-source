# Bot do Discord — PSO Brasil

## Integração com o bot completo

O bot completo roda como um processo Node.js separado e expõe uma API HTTP somente de leitura. O site consulta todas as páginas de eventos da API e publica transferências, demissões e contratos encerrados. O nickname é cruzado com `lib/catalog.ts`; quando uma transferência encontra uma carta com overall 84 ou maior, ela também aparece automaticamente em Notícias com a imagem da carta.

Configure estes segredos no Worker do site; nunca os coloque no GitHub ou em código enviado ao navegador:

```env
PSO_API_URL=https://endereco-publico-da-api-do-bot
PSO_API_KEY=chave-nova-compartilhada-com-o-bot
PSO_GUILD_ID=id-do-servidor
```

No processo do bot, `MARKET_API_KEY` deve ter o mesmo valor de `PSO_API_KEY`. A API deve usar HTTPS e `API_ALLOWED_ORIGIN=https://psobr-site-source.xangunhas.workers.dev`.

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
