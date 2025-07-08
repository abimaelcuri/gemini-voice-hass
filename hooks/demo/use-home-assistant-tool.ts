/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect } from 'react';
import { LiveServerToolCall } from '@google/genai';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { HOME_ASSISTANT_URL, HOME_ASSISTANT_TOKEN } from '../../lib/constants';

async function callHomeAssistantAPI(path: string, options: RequestInit = {}) {
  const url = `${HOME_ASSISTANT_URL}/api/${path}`;
  console.log('Calling Home Assistant API:', url);
  
  const headers = new Headers({
    'Authorization': `Bearer ${HOME_ASSISTANT_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers,
  });

  console.log('Request headers:', Object.fromEntries(headers.entries()));
  console.log('Request options:', options);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('Response status:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Home Assistant API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const responseText = await response.text();
  console.log('Response text:', responseText);
  return responseText ? JSON.parse(responseText) : { success: true };
}

export function useHomeAssistantTool(client: GenAILiveClient) {
  useEffect(() => {
    if (!client) return;

    const handleToolCall = async (toolCall: LiveServerToolCall) => {
      console.log('Tool call received:', toolCall);
      if (!toolCall.functionCalls) {
        console.log('No function calls in tool call');
        return;
      }

      for (const functionCall of toolCall.functionCalls) {
        console.log('Processing function call:', functionCall.name, functionCall.args);
        let responseContent: object;

        try {
          switch (functionCall.name) {
            case 'list_entities': {
              const data = await callHomeAssistantAPI(`states`);
              if (!Array.isArray(data)) {
                  throw new Error('API response for list_entities is not an array.');
              }
              const simplifiedEntities = data.map((entity: any) => ({
                entity_id: entity.entity_id,
                friendly_name: entity.attributes.friendly_name || entity.entity_id.split('.').slice(1).join(' ').replace(/_/g, ' '),
                state: entity.state
              }));
              responseContent = { entities: simplifiedEntities };
              break;
            }
            case 'get_entity_state': {
              const args = functionCall.args as { entity_id?: string } | undefined;
              const entity_id = args?.entity_id;
              if (!entity_id) throw new Error('entity_id is required.');
              const data = await callHomeAssistantAPI(`states/${entity_id}`);
              responseContent = { state: data.state, attributes: data.attributes };
              break;
            }
            case 'call_service': {
              const args = functionCall.args as { domain?: string; service?: string; entity_id?: string; service_data?: string } | undefined;
              const { domain, service, entity_id, service_data } = args || {};
              if (!domain || !service || !entity_id) {
                throw new Error('domain, service, and entity_id are required.');
              }
              
              let body: { entity_id: string, [key: string]: any } = { entity_id };
              
              if (service_data) {
                if (typeof service_data !== 'string') {
                  throw new Error('service_data must be a JSON formatted string.');
                }
                try {
                   const parsedData = JSON.parse(service_data);
                   body = { ...body, ...parsedData };
                } catch (e) {
                   throw new Error('service_data contains invalid JSON.');
                }
              }

              await callHomeAssistantAPI(`services/${domain}/${service}`, {
                method: 'POST',
                body: JSON.stringify(body),
              });
              responseContent = { result: `Successfully called service ${domain}.${service} on ${entity_id}.` };
              break;
            }
            default:
              return;
          }
        } catch (error: unknown) {
          console.error(`Error handling tool call "${functionCall.name}":`, error);
          const message = error instanceof Error ? error.message : String(error);
          responseContent = { error: message };
        }

        console.log('Sending tool response:', responseContent);
        client.sendToolResponse({
          functionResponses: [
            {
              name: functionCall.name,
              id: functionCall.id, // Adiciona o id exigido pela API
              response: {
                functionResponse: {
                  name: functionCall.name,
                  content: responseContent,
                },
              },
            },
          ],
        });
        console.log('Tool response sent successfully');
      }
    };

    client.on('toolcall', handleToolCall);
    return () => {
      client.off('toolcall', handleToolCall);
    };
  }, [client]);
}