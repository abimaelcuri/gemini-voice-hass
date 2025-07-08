/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Default Live API model to use
 */
export const DEFAULT_LIVE_API_MODEL = process.env.GEMINI_MODEL;
// export const DEFAULT_LIVE_API_MODEL = 'gemini-2.0-flash-live-001'; 
// export const DEFAULT_LIVE_API_MODEL = 'gemini-live-2.5-flash-preview'; 
// export const DEFAULT_LIVE_API_MODEL = 'gemini-2.5-flash-preview-native-audio-dialog';
// export const DEFAULT_LIVE_API_MODEL = 'gemini-2.5-flash-exp-native-audio-thinking-dialog';
// export const DEFAULT_LIVE_API_MODEL = 'gemini-2.5-flash';

/**
 * Home Assistant Configuration
 * IMPORTANT: Replace these placeholder values with your Home Assistant URL and a Long-Lived Access Token.
 */
export const HOME_ASSISTANT_URL = process.env.HASS_URL;
export const HOME_ASSISTANT_TOKEN = process.env.HASS_TOKEN;