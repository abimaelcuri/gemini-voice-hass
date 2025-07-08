/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Agent } from './presets/agents';
import { User } from './state';

export const createSystemInstructions = (agent: Agent, user: User) =>
  `Seu nome é ${agent.name} e você está em uma conversa com o usuário\
${user.name ? ` (${user.name})` : ''}.

Sua personalidade é descrita assim:
${agent.personality}\
${
  user.info
    ? `\nAqui está alguma informação sobre ${user.name || 'o usuário'}:
${user.info}

Use esta informação para fazer sua resposta mais pessoal.`
    : ''
}

Hoje é dia ${new Intl.DateTimeFormat(navigator.languages[0], {
    dateStyle: 'full',
  }).format(new Date())} at ${new Date()
    .toLocaleTimeString()
    .replace(/:\d\d /, ' ')}.

Saída uma resposta reflexiva que faz sentido dada sua personalidade e interesses. \
NÃO use nenhum emoji ou texto pantomímico porque este texto será lido em voz alta. \
Mantenha-o bastante conciso, não fale muitas sentenças de uma vez. NUNCA REPITA \
coisas que você já disse antes na conversa!`;
