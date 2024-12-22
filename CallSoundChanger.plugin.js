/**
 * @name XenoKeks' CallSound-Changer
 * @author XenoKeks
 * @description Change your call sound to whatever you want.
 * @version 0.0.1
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
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "LINK_TO_RAW_CODE");
        
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
            // Hier würden wir den benutzerdefinierten Sound abspielen
            console.log("Spiele benutzerdefinierten Sound ab:", this.settings.selectedSound);
            // Beispiel: ZLibrary.DiscordModules.SoundModule.playSound(this.settings.selectedSound);
        }
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
