# Integração do laboratório ao CRM

Este diretório contém os arquivos alterados e um patch para o CRM fornecido em `deskcomm-main`. Essa árvore não veio com `.git`; a integração fica versionada aqui sem publicar o CRM inteiro, credenciais ou dados de clientes. O código derivado mantém a licença em `LICENSE-DeskcommCRM.txt`.

## Instalar em uma cópia do CRM

1. Revise `laboratory.patch` e rode `git apply --check /caminho/laboratory.patch` na raiz do CRM. Aplique com `git apply` após verificar. Os mesmos arquivos estão em `files/` para revisão.
2. Instale as dependências com o lock existente (`pnpm install --frozen-lockfile`).
3. Gere o cliente do laboratório com base `/laboratory-office/` e copie **somente** o cliente estático para `public/laboratory-office/`. Os assets de runtime também precisam usar essa base. Não publique o servidor local nem seus dados.
4. Suba o CRM com Supabase Auth, banco e motor de agentes configurados. O motor exige `SUPABASE_DB_URL` e uma credencial LLM válida (da organização ou configuração da instalação). `INTERNAL_AGENT_RUN_STUB=true` bloqueia a execução. Nenhuma variável nova foi adicionada.
5. Entre na organização desejada. Abra **Agentes → LOBY** ou a entrada **LOBY** na navegação de IA. Configure/crie agentes pelo cadastro existente e publique a versão com as permissões do CRM.

Nenhum usuário ou agente é criado automaticamente. Equipe sugerida para cadastro manual: Taynara (vendas), Thaysa (design), Lucas (frontend), Rafael (backend/integrações), Gustavo (QA), Rodrigo (infraestrutura) e Isaias (suporte). Célio é o proprietário humano. Os nomes de moradores ambiente do mapa não significam que esses cadastros existam no banco.

## Visual primeiro

O LOBY está na etapa visual: o mapa exibe a equipe ambiente e os estados consultados do CRM. O botão **Tarefas · em breve** fica desativado; a página não faz POST de tarefas nem executa agentes. Moradores andando não significam trabalho de IA em andamento. A integração de execução será habilitada em outra etapa.

## API preparada, sem acionamento pela interface

`POST /api/v1/laboratory/tasks` aceita somente `{agent_id, task_type:"agent_response_preview", instruction}`. É uma **prévia real de resposta**, pelo mesmo `testAgentVersion` usado na tela de teste do CRM, com modelo, ferramentas, guardrails e orçamento existentes. Pode consumir créditos quando solicitada pelo administrador. Não envia mensagens, não aplica propostas de ferramentas, não executa terminal nem tarefas de programação. Não existe fila de programação escondida nessa API.

A rota busca a versão publicada do agente na organização ativa, rejeita agente pausado/inativo/arquivado e delega ao handler canônico de teste. Esse handler persiste `ai_agent_runs`, audita `ai_agent.tested` e devolve texto e impedimentos reais. A API retorna o texto ao chamador; o painel atual não oferece um formulário para acioná-la e consulta apenas os estados persistidos. Não há novas transcrições armazenadas por esse painel. Execuções normais de WhatsApp são registradas pelo motor em `llm_calls` e não são confundidas com essas prévias.

A autenticação usa `requireRole`: manager lê, admin executa, com MFA e restrições de suporte existentes. O tenant vem da organização ativa resolvida no servidor, nunca de query/body. Toda consulta tem filtro explícito `organization_id`. Body com tenant ou tipo de tarefa desconhecido é recusado. POST exige a mesma origem. Nenhuma API key é enviada para iframe, URL ou armazenamento do navegador.

`GET /api/v1/laboratory` retorna `{data:{organization_id,organization_name,can_execute,execution,agents,runs}}` com projeção mínima. Falha de consulta é erro; falta de configuração aparece como indisponibilidade; não se fabrica sucesso nem consumo de tokens. A disponibilidade estrutural do motor não garante credencial LLM válida: a execução pode falhar com a mensagem do motor.

## Ponte com o mapa

O iframe usa `/laboratory-office/index.html?crm=1`. O cliente CRM manda `{type:"lotorium.crm.snapshot",revision,snapshot}` para a mesma origem e responde a `lotorium.crm.ready`. `installCrmBridge` no cliente aceita somente mensagens do pai com mesma origem, fixa a primeira organização e rejeita revisão antiga ou payload malformado. Ao mudar organização, o laboratório precisa ser reaberto. Nenhum snapshot local, conta Codex/Claude, diretório, prompt, terminal ou sessão entra nessa ponte.

O modo CRM monta somente o mapa e essa ponte. Não chama `store.connect`, monitor de sessões ou UI de terminais. A projeção para o canvas possui os campos numéricos exigidos pelo tipo interno, mas nenhuma UI de estatísticas locais deve ser montada: esses campos não são métricas CRM.

## Verificação e limites

Testes de política e ponte cobrem origem, fonte da mensagem, tenant, revisões antigas, configuração ausente e seleção do agente. Testes das rotas cobrem filtros, RBAC, recusa entre tenants e despacho para a versão publicada. Rode no CRM:

```sh
pnpm typecheck
pnpm exec eslint app/api/v1/laboratory app/app/ai/laboratory lib/laboratory app/app/ai/agents/page.tsx lib/navigation/catalogo.ts
pnpm exec vitest run lib/laboratory/policy.test.ts app/api/v1/laboratory
```

Não houve migração nem escrita em banco real, chamada LLM, envio externo ou deploy. A prova integrada com login real, dois tenants, bundle estático e credencial de teste exige um ambiente CRM configurado; os testes unitários não substituem essa validação visual. Estado de conexão pendente não significa execução bem-sucedida.

## Sistema vivo

Entrada: navegação IA e botão na lista de agentes. Consumidor: handler canônico `ai/agents/[id]/versions/[vid]/test` → `testAgentVersion`. A API de prévia preparada pode retornar resposta ao chamador e registrar status em `ai_agent_runs` e auditoria `ai_agent.tested`, mas o LOBY visual ainda não a aciona. O painel consulta a cada cinco segundos e retira o snapshot se a consulta falha; não preserva estado antigo como se estivesse conectado. Falhas de consulta aparecem no painel; erros da API de prévia são retornados ao chamador. Modelo, credencial e materiais continuam no cadastro existente. Não há reparação automática nem reexecução automática com gasto de IA.
