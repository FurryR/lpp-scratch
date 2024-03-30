/// <reference path="../node_modules/@turbowarp/types/types/scratch-vm-extension.d.ts" />

interface Collaborator {
  /**
   * Collaborator name.
   */
  collaborator: string
  /**
   * Collaborator profile URL.
   */
  collaboratorURL?: string
}

declare interface Window {
  tempExt?: {
    /**
     * Extension class.
     */
    Extension: new (runtime: VM.Runtime) => Scratch.Extension
    info: {
      /**
       * Extension name.
       */
      name: string
      /**
       * Extension description.
       */
      description: string
      /**
       * Extension ID.
       */
      extensionId: string
      /**
       * Is the extension featured?
       */
      featured: boolean
      /**
       * Is the extension disabled?
       */
      disabled: boolean
      /**
       * @deprecated Collaborator name.
       */
      collaborator?: string
      /**
       * Extension cover URL.
       */
      iconURL?: string
      /**
       * Extension inset icon URL.
       */
      insetIconURL?: string
      /**
       * @deprecated Collaborator profile URL.
       */
      collaboratorURL?: string
      /**
       * Collaborator list.
       */
      collaboratorList?: Collaborator[]
    }
    /**
     * Translations.
     */
    l10n: Record<string, Record<string, string>>
  }
}
