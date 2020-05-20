/* eslent-env node */
/* global xelib, registerPatcher, patcherUrl, info */

const {
  IsWinningOverride,
  GetFlag,
  HasElement,
  GetUIntValue,
  SetFlag
} = xelib

registerPatcher({
  info: info,
  gameModes: [xelib.gmFO4],
  settings: {
    label: info.name,
    templateUrl: `${patcherUrl}/partials/settings.html`,
    defaultSettings: {
      patchFileName: 'zPatch.esp'
    }
  },
  execute: (patchFile, helpers, settings, locals) => ({
    process: [
      {
        load: {
          signature: 'WEAP',
          filter: function (record) {
            if (!IsWinningOverride(record)) {
              return false
            }
            if (GetFlag(record, 'DNAM\\Flags', 'Not Playable') || GetFlag(record, 'DNAM\\Flags', 'Not Used In Normal Combat') || GetFlag(record, 'DNAM\\Flags', 'Embedded Weapon') || GetFlag(record, 'DNAM\\Flags', 'Automatic') || GetFlag(record, 'DNAM\\Flags', 'Repeatable Single Fire')) {
              return false
            }
            if (HasElement(record, 'ETYP')) {
              var equipmentType = GetUIntValue(record, 'ETYP')
              if (equipmentType === 0x00046AAC) { // GrenadeSlot
                return false
              }
            }
            return true
          }
        },
        patch: function (record) {
          helpers.logMessage(`Patching ${xelib.LongName(record)}`)
          var hasAmmo = GetUIntValue(record, 'DNAM\\Ammo')
          if (hasAmmo !== 0) {
            SetFlag(record, 'DNAM\\Flags', 'Repeatable Single Fire', true)
          } else {
            SetFlag(record, 'DNAM\\Flags', 'Automatic', true)
          }
        }
      }
    ]
  })
})
