# LOTORIUM LABS

Laboratório virtual em pixel art para visualizar os agentes e as execuções da sua organização no CRM.

Este repositório pertence ao projeto [lotoriumlabsvirtualoffice](https://github.com/celioantonio7/lotoriumlabsvirtualoffice). A interface ativa funciona exclusivamente com o CRM: não descobre sessões locais, não instala hooks e não abre terminais.

## Executar e visualizar

Requisitos: Node.js 22.12 ou superior e npm.

```sh
npm ci
npm run dev:client
```

Abra o endereço informado pelo Vite. A prévia independente mostra a cena e os personagens; dados operacionais reais dependem da integração autenticada com o CRM. Para gerar e servir a versão de produção local:

```sh
npm run build
npm start
```

O servidor local abre em `http://127.0.0.1:4747`. A variável `LOTORIUM_LABS_PORT` altera a porta. A rota `/api/health` informa o modo `crm-only`; as demais rotas `/api/` não oferecem recursos de execução local.

## Publicar no CRM

```sh
npm run build:client
npm run build:loby -- /caminho/para/deskcomm-crm
```

O comando recompila o cliente com a base `/laboratory-office/` e copia somente os arquivos públicos da cena para o diretório LOBY da integração. Consulte [integração Deskcomm](integrations/deskcomm/README.md) para os arquivos e passos da aplicação hospedeira. Publique o resultado na mesma origem do CRM: o canal entre a página e o iframe verifica origem, janela remetente, organização e revisão do snapshot.

O CRM continua responsável por autenticação, autorização por organização, consulta de agentes e execuções e qualquer comando de execução. Não coloque chaves privadas, credenciais ou tokens no HTML, nos assets ou no repositório.

## Estado dos recursos

- Cena virtual, personagens e navegação visual disponíveis na interface.
- Dados de agentes e execuções recebidos do CRM por snapshots autenticados na aplicação hospedeira.
- Execução depende da disponibilidade e das permissões declaradas pelo CRM; a cena não é um executor.
- Recursos históricos de sessões locais permanecem no código como legado, sem entrada na aplicação ou comandos npm de instalação.

## Verificação

```sh
npm run typecheck
npm test
npm run i18n:check
npm run build
```

## Créditos e licença

Código distribuído sob [MIT](LICENSE), com o aviso de copyright original de Márcio Junior preservado. O componente visual page-mascot mantém os créditos de Kamran nos arquivos em que é utilizado. Consulte também [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). As imagens de pixel art e os scripts de processamento herdados fazem parte dos arquivos do projeto; créditos legais não representam integração com o produto de origem.
