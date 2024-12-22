/**
 * @name XenoKeks' CallSound-Changer
 * @author XenoKeks
 * @description Change your call sound to whatever you want.
 * @version 0.0.1
 * @source https://github.com/silez/DiscordCallSoundChanger/blob/main/CallSoundChanger.plugin.js
 * @updateUrl https://raw.githubusercontent.com/silez/DiscordCallSoundChanger/refs/heads/main/CallSoundChanger.plugin.js
 * @donate https://paypal.me/xenokeks
 * @authorLink https://github.com/silez
 */

module.exports = class CallSoundChanger {
    constructor() {
        this.defaultSettings = {
            selectedSound: 'default',
            customSounds: []
        };
    }

    start() {
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing", `The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "https://raw.githubusercontent.com/silez/DiscordCallSoundChanger/refs/heads/main/CallSoundChanger.plugin.js");
        
        this.initialize();
    }

    stop() {
        if (global.ZeresPluginLibrary) {
            ZLibrary.Patcher.unpatchAll(this.getName());
        }
    }

    initialize() {
        this.settings = ZLibrary.PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
        this.patchCallSound();
    }

    patchCallSound() {
        ZLibrary.Patcher.after(this.getName(), ZLibrary.DiscordModules.SoundModule, "playSound", (_, [soundName]) => {
            if (soundName === "call_ringing") {
                this.playCustomSound();
                return false;
            }
        });
    }

    playCustomSound() {
        if (this.settings.selectedSound !== 'default') {
            const audio = new Audio();
            audio.src = this.getSoundPath(this.settings.selectedSound);
            audio.volume = ZLibrary.DiscordModules.MediaEngineStore.getOutputVolume() / 100;
            audio.play().catch(error => {
                console.error("Fehler beim Abspielen des benutzerdefinierten Sounds:", error);
            });
        }
    }

    getSoundPath(soundName) {
        const soundPaths = {
            'sound1': 'PATH_TO_SOUND_1',
            'sound2': 'PATH_TO_SOUND_2',
            'sound3': 'PATH_TO_SOUND_3'
        };
        return soundPaths[soundName] || '';
    }

    getSettingsPanel() {
        const panel = ZLibrary.PluginUtilities.createSettingsPanel(this, () => {
            this.saveSettings();
        });

        panel.append(new ZLibrary.Settings.SettingGroup("Anrufton-Einstellungen").append(
            new ZLibrary.Settings.Dropdown("Ausgewählter Ton", "Wähle den Anrufton aus.", this.settings.selectedSound, [
                { label: "Standard", value: "default" },
                { label: "Ton 1", value: "sound1" },
                { label: "Ton 2", value: "sound2" },
                { label: "Ton 3", value: "sound3" }
            ], (value) => {
                this.settings.selectedSound = value;
                this.saveSettings();
            })
        ));

        return panel.getElement();
    }

    saveSettings() {
        ZLibrary.PluginUtilities.saveSettings(this.getName(), this.settings);
    }

    getName() {
        return "CallSoundChanger";
    }

    getDescription() {
        return "Change your call sound to whatever you want.";
    }

    getVersion() {
        return "0.0.1";
    }

    getAuthor() {
        return "XenoKeks";
    }
};
