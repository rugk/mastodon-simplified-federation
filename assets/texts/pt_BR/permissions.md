# Permissões solicitadas

Para uma explicação geral da permissão de complemento, consulte [este artigo de suporte](https://support.mozilla.org/kb/permission-request-messages-firefox-extensions).

## Permissões de instalação

| Id Interno                  | Permissão                         | Explicação                                                                                                                                                                                                                                                                                                                     |
|:----------------------------|:----------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `http://*/*`, `https://*/*` | Acessa seus dados para todos os sites | Necessário para obter acesso a qualquer site de um servidor que possa ser uma instância do Mastodon. Como qualquer servidor pode ser uma instância do Mastodon, ele precisa ter acesso a todos [HTTP](https://en.wikipedia.org/wiki/HTTP) and [HTTPS](https://en.wikipedia.org/wiki/HTTPS) [URLs](https://en.wikipedia.org/wiki/Uniform_Resource_Locator). |
| `notifications` | Exibir notificações para você | Necessário para mostrar uma notificação caso o redirecionamento ou outra coisa falhe. |

## Permissões ocultas
Além disso, ele solicita essas permissões, que não são solicitadas no Firefox quando o complemento é instalado, pois não são uma permissão profunda.

| Id Interno   | Permissão            | Explicação                                                                                                                                |
|:-------------|:---------------------|:-------------------------------------------------------------------------------------------------------------------------------------------|
| `webRequest` | Acessar solicitações da web  | Necessário para redirecionamento de [URLs](https://en.wikipedia.org/wiki/Uniform_Resource_Locator) para o servidor, onde você tem sua conta Mastodon. |
| `storage`    | Acesse o armazenamento local | Necessário para salvar opções                                                                                                                  |
