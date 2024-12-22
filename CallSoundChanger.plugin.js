/**
 * @name XenoKeks' CallSound-Changer
 * @author XenoKeks
 * @description Change your call sound to whatever you want.
 * @version 0.0.2
 * @source https://github.com/silez/DiscordCallSoundChanger/blob/main/CallSoundChanger.plugin.js
 * @updateUrl https://raw.githubusercontent.com/silez/DiscordCallSoundChanger/refs/heads/main/CallSoundChanger.plugin.js
 * @donate https://paypal.me/xenokeks
 * @authorLink https://github.com/silez
 */

module.exports = class CallSoundChanger {
    constructor() {
        this.defaultSettings = {
            selectedSound: 'default',
            customSounds: [],
            language: 'en'
        };
        this.languages = {
            en: {
                settings: "Settings",
                callSoundSettings: "Call Sound Settings",
                pluginSettings: "Plugin Settings",
                sounds: "Sounds",
                preview: "Preview",
                stop: "Stop",
                language: "Language",
                defaultSound: "Default",
                sound1: "Sound 1",
                sound2: "Sound 2",
                sound3: "Sound 3"
            },
            de: {
                settings: "Einstellungen",
                callSoundSettings: "Anrufton-Einstellungen",
                pluginSettings: "Plugin-Einstellungen",
                sounds: "Töne",
                preview: "Vorhören",
                stop: "Stop",
                language: "Sprache",
                defaultSound: "Standard",
                sound1: "Ton 1",
                sound2: "Ton 2",
                sound3: "Ton 3"
            }
        };
    }

    start() {
        if (!global.ZeresPluginLibrary) {
            return window.BdApi.alert("Library Missing", `The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        }
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "https://raw.githubusercontent.com/silez/DiscordCallSoundChanger/refs/heads/main/CallSoundChanger.plugin.js");
        
        this.initialize();
    }

    stop() {
        if (global.ZeresPluginLibrary) {
            ZLibrary.Patcher.unpatchAll(this.getName());
        }
    }

    initialize() {
        try {
            this.settings = ZLibrary.PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
            this.patchCallSound();
        } catch (error) {
            console.error(`[${this.getName()}] Fehler beim Initialisieren:`, error);
        }
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
            'default': 'PATH_TO_DEFAULT_SOUND',
            'sound1': 'PATH_TO_SOUND_1',
            'sound2': 'PATH_TO_SOUND_2',
            'sound3': 'PATH_TO_SOUND_3'
        };
        return soundPaths[soundName] || '';
    }

    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.style.padding = '20px';
        panel.style.backgroundColor = '#36393f';
        panel.style.color = '#dcddde';
        panel.style.fontFamily = 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif';

        const createGroup = (title, content) => {
            const group = document.createElement('div');
            group.style.backgroundColor = '#2f3136';
            group.style.borderRadius = '5px';
            group.style.padding = '15px';
            group.style.marginBottom = '20px';

            const header = document.createElement('div');
            header.textContent = `${title} ▼`;
            header.style.fontWeight = 'bold';
            header.style.marginBottom = '10px';
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            group.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.style.display = 'none';
            content(contentDiv);
            group.appendChild(contentDiv);

            header.onclick = () => {
                contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
                header.textContent = `${title} ${contentDiv.style.display === 'none' ? '▼' : '▲'}`;
            };

            return group;
        };

        const t = (key) => this.languages[this.settings.language][key];

        const title = document.createElement('h2');
        title.textContent = t('settings');
        title.style.marginBottom = '20px';
        title.style.borderBottom = '1px solid #3e4147';
        title.style.paddingBottom = '10px';
        panel.appendChild(title);

        const callSoundGroup = createGroup(t('callSoundSettings'), (content) => {
            const soundOptions = [
                { name: t('defaultSound'), value: "default" },
                { name: t('sound1'), value: "sound1" },
                { name: t('sound2'), value: "sound2" },
                { name: t('sound3'), value: "sound3" }
            ];

            let previewAudio = null;

            soundOptions.forEach(sound => {
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.marginBottom = '10px';
                container.style.padding = '10px';
                container.style.backgroundColor = '#36393f';
                container.style.borderRadius = '3px';

                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'callSound';
                radio.value = sound.value;
                radio.id = `sound-${sound.value}`;
                radio.checked = this.settings.selectedSound === sound.value;
                radio.style.marginRight = '10px';
                radio.addEventListener('change', () => {
                    this.settings.selectedSound = sound.value;
                    this.saveSettings();
                });

                const label = document.createElement('label');
                label.htmlFor = `sound-${sound.value}`;
                label.textContent = sound.name;
                label.style.flex = '1';
                label.style.cursor = 'pointer';

                const previewButton = document.createElement('button');
                previewButton.textContent = t('preview');
                previewButton.style.backgroundColor = '#4f545c';
                previewButton.style.border = 'none';
                previewButton.style.color = '#ffffff';
                previewButton.style.padding = '5px 10px';
                previewButton.style.borderRadius = '3px';
                previewButton.style.cursor = 'pointer';
                previewButton.addEventListener('mouseenter', () => {
                    previewButton.style.backgroundColor = '#5d6269';
                });
                previewButton.addEventListener('mouseleave', () => {
                    previewButton.style.backgroundColor = '#4f545c';
                });
                previewButton.addEventListener('click', () => {
                    if (previewAudio && !previewAudio.paused) {
                        previewAudio.pause();
                        previewAudio.currentTime = 0;
                        previewButton.textContent = t('preview');
                    } else {
                        if (previewAudio) {
                            previewAudio.pause();
                            previewAudio.currentTime = 0;
                        }
                        previewAudio = new Audio(this.getSoundPath(sound.value));
                        previewAudio.play();
                        previewButton.textContent = t('stop');
                        previewAudio.onended = () => {
                            previewButton.textContent = t('preview');
                        };
                    }
                });

                container.appendChild(radio);
                container.appendChild(label);
                container.appendChild(previewButton);

                content.appendChild(container);
            });
        });

        const pluginSettingsGroup = createGroup(t('pluginSettings'), (content) => {
            const languageContainer = document.createElement('div');
            languageContainer.style.display = 'flex';
            languageContainer.style.alignItems = 'center';
            languageContainer.style.marginBottom = '10px';
            languageContainer.style.padding = '10px';
            languageContainer.style.backgroundColor = '#36393f';
            languageContainer.style.borderRadius = '3px';

            const languageLabel = document.createElement('label');
            languageLabel.textContent = t('language');
            languageLabel.style.flex = '1';

            const languageSelect = document.createElement('select');
            languageSelect.style.backgroundColor = '#4f545c';
            languageSelect.style.border = 'none';
            languageSelect.style.color = '#ffffff';
            languageSelect.style.padding = '5px 10px';
            languageSelect.style.borderRadius = '3px';
            languageSelect.style.cursor = 'pointer';

            const languages = [
                { value: 'en', label: 'English' },
                { value: 'de', label: 'Deutsch' }
            ];

            languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.value;
                option.textContent = lang.label;
                languageSelect.appendChild(option);
            });

            languageSelect.value = this.settings.language;
            languageSelect.addEventListener('change', () => {
                this.settings.language = languageSelect.value;
                this.saveSettings();
                // Refresh the settings panel to update the language
                const settingsLayer = document.querySelector('.layer-3QrUeG[aria-label="USER_SETTINGS"]');
                if (settingsLayer) {
                    const closeButton = settingsLayer.querySelector('.closeButton-1tv5uR');
                    if (closeButton) {
                        closeButton.click();
                        setTimeout(() => {
                            ZLibrary.DiscordModules.UserSettingsStore.open('CallSoundChanger');
                        }, 100);
                    }
                }
            });

            languageContainer.appendChild(languageLabel);
            languageContainer.appendChild(languageSelect);

            content.appendChild(languageContainer);
        });

        panel.appendChild(callSoundGroup);
        panel.appendChild(pluginSettingsGroup);

        return panel;
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
        return "0.0.2";
    }

    getAuthor() {
        return "XenoKeks";
    }
};
