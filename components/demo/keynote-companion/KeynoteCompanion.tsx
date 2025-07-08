/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef } from 'react';
import {
  Modality,
  Type,
} from '@google/genai';

import BasicFace from '../basic-face/BasicFace';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { createSystemInstructions } from '@/lib/prompts';
import { useAgent, useUser } from '@/lib/state';
import { useHomeAssistantTool } from '../../../hooks/demo/use-home-assistant-tool';

export default function KeynoteCompanion() {
  const { client, connected, setConfig } = useLiveAPIContext();
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const user = useUser();
  const { current } = useAgent();

  // Set the configuration for the Live API
  useEffect(() => {
    const homeAssistantTool = {
      functionDeclarations: [
        {
          name: 'list_entities',
          description: 'Obtém uma lista de todos os dispositivos e entidades disponíveis no Home Assistant, incluindo seus entity_id, friendly_name e estado atual. Use isso para encontrar o entity_id correto para um dispositivo quando o usuário se referir a ele pelo nome.'
        },
        {
          name: 'get_entity_state',
          description: 'Obtém o estado atual e os atributos de uma única entidade do Home Assistant. Use isso para verificar se uma luz está acesa, obter uma leitura de sensor, etc. Você deve fornecer o entity_id.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              entity_id: {
                type: Type.STRING,
                description: 'The ID of the entity. For example: "light.living_room_light".'
              }
            },
            required: ['entity_id']
          }
        },
        {
          name: 'call_service',
          description: 'Chama um serviço para controlar uma entidade no Home Assistant. Use isso para ligar/desligar dispositivos, alterná-los, definir brilho, alterar cores, etc. Você deve fornecer o domain, service e entity_id.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              domain: {
                type: Type.STRING,
                description: 'The domain of the service. For example: "light", "switch", "cover".'
              },
              service: {
                type: Type.STRING,
                description: 'The name of the service to call. For example: "turn_on", "turn_off", "toggle".'
              },
              entity_id: {
                type: Type.STRING,
                description: 'The ID of the entity to call the service on. For example: "light.living_room_light".'
              },
              service_data: {
                type: Type.STRING,
                description: 'Optional. A JSON string with additional data for the service call. For example for setting brightness: \'{"brightness_pct": 50}\'. For a simple turn_on/off, this can be omitted.'
              }
            },
            required: ['domain', 'service', 'entity_id']
          }
        }
      ]
    };

    setConfig({
      tools: [homeAssistantTool],
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: current.voice },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: createSystemInstructions(current, user),
          },
        ],
      },
    });
  }, [setConfig, user, current]);

  // Handle tool calls using the custom hook
  useHomeAssistantTool(client);

  // Initiate the session when the Live API connection is established
  // Instruct the model to send an initial greeting message
  useEffect(() => {
    const beginSession = async () => {
      if (!connected) return;
      client.send(
        {
          text: 'Receba o usuário com boas vindas, à disposição para ajudar.',
        },
        true
      );
    };
    beginSession();
  }, [client, connected]);

  return (
    <div className="keynote-companion">
      <BasicFace canvasRef={faceCanvasRef!} color={current.bodyColor} />
    </div>
  );
}