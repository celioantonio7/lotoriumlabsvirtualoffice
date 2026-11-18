# LOTORIUM LABS — personalização local do LOTORIUM LABS

Pedido autorizado: manter instalação isolada em /home/celio/lotoriumlabs e usar identidade oficial LOTORIUM LABS, preservando funcionamento, dados e licença do projeto original.

Abordagem: personalização pequena da interface existente e metadados, mantendo nomes internos LOTORIUM_LABS, protocolos, diretórios de sessão e configurações. Alternativas rejeitadas: renomear todo o código quebraria compatibilidade; recriar a interface ampliaria o escopo sem necessidade.

Branch: local/lotorium-labs-brand. Nenhuma publicação em repositório externo.

Ativos oficiais copiados de /home/celio/lotorium/public/assets/lotorium: lotorium-labs-menu.svg, 07_favicon_simbolo.svg e logo-lotorium-512.webp. Originais não alterados.

Mudanças: cabeçalho, tela de carregamento, título da aba, notificações, ícone/manifest e seçãoSobre. Sobre identifica base LOTORIUM LABS, ©2026MárcioJunior, licençaMIT; LICENSE original preservada. Documentação e nomes de comandos/hook do projeto de origem são preservados para suporte.

Verificações: build de produção, TypeScript, traduções completas e diff sem problemas de espaço; reinício controlado eHTTP para página, logos,manifest,health e snapshot. O launcher segue somente127.0.0.1, World e updatecheck desligados, sem terminal/mensagens/PTY/remoto, sem hooks novos.

Não substitui nova auditoria de segurança. Cabeçalho e preload foram reproduzidos e conferidos visualmente em screenshots Playwright a1440×900. UseCtrl+Shift+R se a aba antiga continuar com o nome em cache.


## Correção visual — 17/11/2026

Causa: a variante menu-neon.svg era uma camada de reflexos e não continha desenho completo das letras; foi selecionada indevidamente na primeira personalização. Reproduzido no navegador: só fragmentos verdes apareciam. Substituída pelo arquivo oficial completo menu.svg, já utilizado pelo siteLotorium, sem alterar o original; wordmark do cabeçalho ajustado para176×36. Preload preserva proporção234×48.

Validação visual Playwright/Chrome: /tmp/lotorium-logo-before.png, /tmp/lotorium-logo-header-after.png, /tmp/lotorium-logo-after.png, /tmp/lotorium-preload-after.png. Preload capturado mantendo stream pendente, sem modificar código de produção. Ambas as telas mostramLOTORIUM eLABS completos. Console sem pageerror.


## Ícone3D e neon aprovados — 17/11/2026

Usado lotorium-icon.webp já existente (cópia de logo-lotorium-512.webp do projetoLotorium), correspondente ao guaxinim3Dpreto/prata/olhosverdes mostrado pelo usuário. Sem fundoazul de seleção incorporado. Cabeçalho, preload, favicon e manifesto usam esse ícone.

Wordmarkcompleto permanece como base; overlayoficial menu-neon.svg aplicado por cima em proporções iguais1040×212, sem substituir as letras. Acento de interface alterado deazul paraverde-lima#b6f500, preservando cores semânticas dealertas. Brilho estático sutil nosreflexos eícone, sem nova animação.

Validação: build/typecheck concluídos, screenshotsvistos /tmp/lotorium-neon-header-after.png e /tmp/lotorium-neon-preload-after.png; console sempageerror. Reinício controlado comlauncheroriginal; health confirma isolamento local e capacidades remotasdesligadas.
