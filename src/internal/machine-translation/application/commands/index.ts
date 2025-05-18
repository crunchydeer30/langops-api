export * from './base-translate';
export * from './persist-machine-translations';

import { PersistMachineTranslationsHandler } from './persist-machine-translations';

export const MachineTranslationCommandHandlers = [
  PersistMachineTranslationsHandler,
];
