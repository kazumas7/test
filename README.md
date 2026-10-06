# ELEITORA — Eleições 2026

Painel eleitoral em uma única página, pronto para publicar no GitHub Pages. A interface combina placar, histórico, mapa por UFs, grafo de fontes, centro de comando do 2º turno e modo de auditoria.

## O que já está pronto

- Totalização presidencial com tentativa de leitura direta dos arquivos JSON oficiais do TSE.
- Descoberta automática dos códigos de 1º e 2º turno pelo `ele-c.json` do TSE.
- Polling de 30 segundos, com fallback para um snapshot oficial verificado caso a fonte esteja indisponível.
- Consulta por UF para Governador, Senador, Deputado Federal e Deputado Estadual/Distrital.
- Mapa interativo com capitais como pontos, linhas de conexão, popup por UF e camada de estado.
- Histórico presidencial de 2018 e 2022 (1º/2º turno) e snapshot 2026 (1º turno).
- Centro de 2º turno com contagem regressiva para 25/10/2026 e 7 disputas de governo.
- Bloco de pesquisas com metodologia resumida, separado do placar oficial.
- Exportação de snapshot JSON.
- Tema claro/escuro persistente.
- Links oficiais para Resultados TSE, Dados Abertos, DivulgaCandContas e IBGE.

## Rodar localmente

Por ser um site estático, basta abrir com um servidor HTTP:

```bash
python -m http.server 8080
```

Depois, abra `http://localhost:8080`.

## Publicar no GitHub Pages

1. Crie um repositório.
2. Envie todos os arquivos desta pasta.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
5. Salve e aguarde o endereço do Pages.

Não há build obrigatório, Node ou backend para a versão básica.

## Fontes e arquitetura

Fonte primária de resultados: `https://resultados.tse.jus.br/oficial`.

Configuração 2026: `https://resultados.tse.jus.br/oficial/comum/config/ele-c.json`.

Documentação técnica TSE: `https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados`.

Dados Abertos: `https://dadosabertos.tse.jus.br/`.

DivulgaCandContas: `https://divulgacandcontas.tse.jus.br/divulga/`.

IBGE localidades: `https://servicodados.ibge.gov.br/api/v1/localidades/estados`.

Mapa: OpenStreetMap.

### Importante sobre “ao vivo”

O site faz polling dos arquivos públicos do TSE. Ele não reprocessa, edita ou “corrige” os dados oficiais. O parser é propositalmente tolerante para o caso de mudanças pequenas no JSON; quando não consegue interpretar o payload, a interface preserva o último snapshot e mostra o status de fallback.

A distribuição oficial do TSE define os arquivos JSON, o ambiente `oficial`, os códigos da eleição e limites de acesso. O projeto usa uma leitura nacional para o presidente e deixa as consultas estaduais sob demanda para evitar excesso de requisições.

## Proxy opcional para ambientes com CORS restritivo

A pasta `proxy/` contém um Cloudflare Worker mínimo que só aceita URLs do domínio oficial de resultados do TSE. Depois de publicar o Worker, abra o painel com o parâmetro `?tseProxy=https://SEU-WORKER.workers.dev`. A aplicação continuará funcionando sem proxy e retornará ao fallback se a leitura direta falhar.

## Proxy opcional para CORS

A pasta `proxy/` contém um Cloudflare Worker mínimo que só permite URLs do domínio oficial de resultados do TSE. Depois de publicá-lo, abra o painel com `?tseProxy=https://SEU-WORKER.workers.dev`. O painel continua funcional sem proxy e cai para o snapshot quando a fonte ao vivo não responder.
