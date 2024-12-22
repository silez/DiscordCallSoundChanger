/**
 * @name XenoKeks' CallSound-Changer
 * @author XenoKeks
 * @description Change your call sound to whatever you want.
 * @version 0.0.5
 * @source https://github.com/silez/DiscordCallSoundChanger/blob/main/CallSoundChanger.plugin.js
 * @updateUrl https://raw.githubusercontent.com/silez/DiscordCallSoundChanger/refs/heads/main/CallSoundChanger.plugin.js
 * @donate https://paypal.me/xenokeks
 * @authorLink https://github.com/silez
 */

const fs = require('fs');
const path = require('path');

module.exports = class CallSoundChanger {
    constructor() {
        this.defaultSettings = {
            selectedSound: 'default',
            customSounds: [],
            language: 'en'
        };
        this.languages = {
            en: {
                title: "XenoKeks' Call Sound Changer",
                settings: "Settings",
                callSoundSettings: "Call Sound Settings",
                pluginSettings: "Plugin Settings",
                sounds: "Sounds",
                preview: "Preview",
                stop: "Stop",
                language: "Language",
                defaultSound: "Default",
                addSound: "Add Sound",
                importSettings: "Import Settings",
                exportSettings: "Export Settings"
            },
            de: {
                title: "XenoKeks' Anrufton-Wechsler",
                settings: "Einstellungen",
                callSoundSettings: "Anrufton-Einstellungen",
                pluginSettings: "Plugin-Einstellungen",
                sounds: "Töne",
                preview: "Vorhören",
                stop: "Stop",
                language: "Sprache",
                defaultSound: "Standard",
                addSound: "Ton hinzufügen",
                importSettings: "Einstellungen importieren",
                exportSettings: "Einstellungen exportieren"
            }
        };
        this.soundFolderPath = path.join(BdApi.Plugins.folder, 'CallSoundChanger');
        this.settingsFilePath = path.join(this.soundFolderPath, 'settings.json');
    }

    start() {
        if (!global.ZeresPluginLibrary) {
            return window.BdApi.alert("Library Missing", `The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        }
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this.getUpdateUrl());

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
            this.ensureSoundFolderExists();
            this.updateCustomSounds();
            this.patchCallSound();
        } catch (error) {
            console.error(`[${this.getName()}] Initialization error`, error);
        }
    }

    ensureSoundFolderExists() {
        if (!fs.existsSync(this.soundFolderPath)) {
            fs.mkdirSync(this.soundFolderPath);
        }
    }

    updateCustomSounds() {
        const files = fs.readdirSync(this.soundFolderPath);
        this.settings.customSounds = files.map(file => ({
            name: path.basename(file, path.extname(file)),
            path: path.join(this.soundFolderPath, file)
        }));
        this.saveSettings();
    }

    patchCallSound() {
        ZLibrary.Patcher.after(this.getName(), ZLibrary.DiscordModules.SoundModule, "playSound", (_, [soundName]) => {
            if (soundName === 'call_ringing') {
                this.playCustomSound();
                return false;
            }
        });
    }

    playCustomSound() {
        const selected = this.settings.customSounds.find(sound => sound.name === this.settings.selectedSound);
        if (selected) {
            const audio = new Audio(selected.path);
            audio.volume = ZLibrary.DiscordModules.MediaEngineStore.getOutputVolume() / 100;
            audio.play().catch(error => console.error("Error playing custom sound:", error));
        }
    }

    getSettingsPanel() {
        const t = key => this.languages[this.settings.language][key];

        const panel = document.createElement('div');
        panel.style.padding = '20px';
        panel.style.backgroundColor = '#36393f';
        panel.style.color = '#dcddde';
        panel.style.fontFamily = 'Whitney, Helvetica Neue, Helvetica, Arial, sans-serif';

        // Titel oben zentriert und in Lila
        const title = document.createElement('h1');
        title.textContent = t('title');
        title.style.color = '#9b59b6';
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '20px';
        panel.appendChild(title);

        const createGroup = (titleText, contentFunc) => {
            const group = document.createElement('div');
            group.style.backgroundColor = '#2f3136';
            group.style.borderRadius = '5px';
            group.style.padding = '15px';
            group.style.marginBottom = '20px';

            const header = document.createElement('div');
            header.textContent = `${titleText} ▼`;
            header.style.cursor = 'pointer';
            header.style.fontWeight = 'bold';
            header.onclick = () => {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
                header.textContent = `${titleText} ${content.style.display === 'none' ? '▼' : '▲'}`;
            };

            const content = document.createElement('div');
            content.style.display = 'none';
            contentFunc(content);

            group.appendChild(header);
            group.appendChild(content);

            return group;
        };

        // Call Sound Settings Group
        panel.appendChild(createGroup(t('callSoundSettings'), content => {

           const soundOptionsContainer = document.createElement('div');

           // Add Sound Button
           const addButtonContainer = document.createElement('div');
           const addButton = document.createElement('button');
           addButton.textContent = t('addSound');
           addButton.style.backgroundColor = '#4f545c';
           addButton.style.border = 'none';
           addButton.style.color = '#ffffff';
           addButton.style.padding = '5px 10px';
           addButton.style.borderRadius = '3px';
           addButton.style.cursor = 'pointer';

           addButton.onclick = () => {
               const inputFileDialog= document.createElement('input');
               inputFileDialog.type= 'file'; 
               inputFileDialog.accept= '.mp3,.wav'; // Accept audio files only

               inputFileDialog.onchange= (event) => {
                   const file= event.target.files[0];
                   if(file) {
                       const newFilePath= path.join(this.soundFolderPath, file.name);
                       fs.copyFileSync(file.path, newFilePath); // Copy the file to the sound folder
                       this.updateCustomSounds(); // Update the list of sounds

                       // Refresh the sound list dynamically
                       while (soundOptionsContainer.firstChild) {
                           soundOptionsContainer.removeChild(soundOptionsContainer.firstChild);
                       }
                       displaySounds(soundOptionsContainer); // Re-render the updated list
                   }
               };

               inputFileDialog.click(); // Open file dialog
           };

           addButtonContainer.appendChild(addButton);
           content.appendChild(addButtonContainer);

           // Display current sounds function
           const displaySounds= (container)=> {

               this.settings.customSounds.forEach(soundEntry=> {

                   const soundContainer= document.createElement('div');

                   soundContainer.style.display= 'flex';
                   soundContainer.style.alignItems= 'center';
                   soundContainer.style.marginBottom= '10px';
                   soundContainer.style.padding= '10px';
                   soundContainer.style.backgroundColor= '#36393f';
                   soundContainer.style.borderRadius= '3px';

                   // Preview button
                   const previewButton= document.createElement('button');
                   previewButton.textContent= t('preview');
                   previewButton.style.backgroundColor= '#4f545c';
                   previewButton.style.border= 'none';
                   previewButton.style.color= '#ffffff';
                   previewButton.style.padding= '5px 10px';
                   previewButton.style.borderRadius= '3px';

                   previewButton.addEventListener('mouseenter', () => {
                       previewButton.style.backgroundColor= '#5d6269';
                   });

                   previewButton.addEventListener('mouseleave', () => {
                       previewButton.style.backgroundColor= '#4f545c';
                   });

                   previewButton.addEventListener('click', () => {
                       const audio= new Audio(soundEntry.path);
                       audio.volume= ZLibrary.DiscordModules.MediaEngineStore.getOutputVolume() / 100;
                       audio.play().catch(error => console.error("Error playing custom sound:", error));
                   });

                   soundContainer.appendChild(previewButton);
                   soundOptionsContainer.appendChild(soundContainer);
               });
           };

           displaySounds(soundOptionsContainer); // Initial call to display sounds

           content.appendChild(soundOptionsContainer); // Append the container for sounds

         }));

         // Plugin Settings Group
         panel.appendChild(createGroup(t('pluginSettings'), content => {

             // Language Selection Container
             const languageContainer= document.createElement('div');
             languageContainer.style.display= 'flex';
             languageContainer.style.alignItems= 'center';
             languageContainer.style.marginBottom= '10px';

             const languageLabel= document.createElement('label');
             languageLabel.textContent= t('language') + ': ';
             languageLabel.style.flex= '1';

             const languageSelect= document.createElement('select');

             Object.keys(this.languages).forEach(langKey=> {

                 const option= document.createElement('option');
                 option.value= langKey;
                 option.textContent= langKey.toUpperCase();

                 if(langKey===this.settings.language) option.selected=true;

                 languageSelect.appendChild(option);

             });

             languageSelect.addEventListener('change', () => {

                 this.settings.language= languageSelect.value;
                 this.saveSettings();

                 // Refresh the settings panel to update the language
                 const settingsLayer= document.querySelector('.layer-3QrUeG[aria-label="USER_SETTINGS"]');

                 if(settingsLayer) {

                    const closeButton=settingsLayer.querySelector('.closeButton-1tv5uR');

                    if(closeButton) {

                        closeButton.click();

                        setTimeout(() => {

                            ZLibrary.DiscordModules.UserSettingsStore.open(this.getName());

                        }, 100);

                    }

                 }

             });

             languageContainer.appendChild(languageLabel);
             languageContainer.appendChild(languageSelect);

             content.appendChild(languageContainer);

             // Import/Export Settings Buttons
             const importExportContainer = document.createElement('div');

             // Import Button
             const importButton = document.createElement('button');
             importButton.textContent = t('importSettings');
             importButton.onclick = () => {
                 const inputFileDialog= document.createElement('input');
                 inputFileDialog.type='file'; 
                 inputFileDialog.accept='.json'; // Accept JSON files only

                 inputFileDialog.onchange=(event)=>{
                     const file= event.target.files[0];
                     if(file){
                         const reader=new FileReader();
                         reader.onload=(e)=>{
                             try{
                                 const importedSettings= JSON.parse(e.target.result);
                                 Object.assign(this.settings, importedSettings); // Merge imported settings with current settings
                                 this.saveSettings(); // Save updated settings
                             }catch(error){
                                 console.error("Error importing settings:", error);
                             }
                         };
                         reader.readAsText(file); // Read the file as text
                     }
                 };

                 inputFileDialog.click(); // Open file dialog
             };
             
             importExportContainer.appendChild(importButton);

             // Export Button
             const exportButton=document.createElement('button');
             exportButton.textContent=t('exportSettings');
             
             exportButton.onclick=()=>{
                 const blob=new Blob([JSON.stringify(this.settings, null, 2)], {type:'application/json'});
                 const url=URL.createObjectURL(blob);
                 
                 const a=document.createElement('a');
                 a.href=url;
                 a.download='settings.json'; // Name of the exported file
                 
                 a.click(); // Trigger download

                 URL.revokeObjectURL(url); // Clean up URL object after download
             };

             importExportContainer.appendChild(exportButton);
             
             content.appendChild(importExportContainer); 

         }));

         return panel;

     }

     saveSettings() {

         ZLibrary.PluginUtilities.saveSettings(this.getName(), this.settings);

     }

     getUpdateUrl() {

         return `https://raw.githubusercontent.com/silez/DiscordCallSoundChanger/refs/heads/main/CallSoundChanger.plugin.js`;

     }

     getName() {

         return "CallSoundChanger";

     }

     getDescription() {

         return "Change your call sound to whatever you want.";

     }

     getVersion() {

         return "0.0.5";

     }

     getAuthor() {

         return "XenoKeks";

     }
};
