/**
 * @file
 * Dialog box for adding a named tab.
 */

import Dialog from './Dialog.js';

var TabPropertiesDlg = function(tabs) {
    Dialog.call(this);

    const MaxName = 8;
    var sel;

    this.open = function() {

        let circuit = tabs.currentCircuit();
        let name = circuit.getName();
        let stats = circuit.stats();

        // Dialog box contents
        var id = this.uniqueId();
        sel = '#' + id;

        var dlg = `
<div class="control1 center"><label for="${id}">Tab name: </label>
<input class="tabname" type="text" id="${id}" value="${name}" spellcheck="false" ${name === 'main' ? "disabled" : ""}></div>`;

        if(name === 'main') {
            dlg += '<p class="center"><em>The main tab cannot be renamed.</em></p>';
        } else {
            dlg += '<p>This page presents information for the ' +
                'currently selected tab. Enter a new name to rename the tab.</p>';
        }

        dlg += `<table>
<tr><th>Property</th><th>Value</th></tr>
<tr><td>Components</td><td>${stats.numComponents}</td></tr>
<tr><td>Connections</td><td>${stats.numConnections}</td></tr>
<tr><td>Width</td><td>${stats.width} pixels</td></tr>
<tr><td>Height</td><td>${stats.height} pixels</td></tr>
</table>`;

        this.contents(dlg, "New Tab");
        Dialog.prototype.open.call(this);
        $(sel).select();
    }

    this.ok = function() {

        // What is the current name?
        let circuit = tabs.currentCircuit();
        if(circuit.getName() === 'main') {
            this.close();
            return;
        }


        let name = $(sel).val();
        name = name.replace(/^\s+|\s+$/gm,'');
        name = this.sanitize(name);
        if(name.length < 1) {
            this.error('Must provide a tab name');
            $(sel).select();
            return;
        }

        if(name.length > MaxName) {
            this.error('Name must be no longer than ' + MaxName + ' characters');
            $(sel).select();
            return;
        }

        //
        // Ensure name does not already exist
        //

        let val = tabs.validateName(name, circuit);
        if(val !== null) {
            this.error(val);
            $(sel).select();
            return;
        }

        if(name !== circuit.getName()) {
            tabs.rename(name);
        }

        this.close();
    }

}

TabPropertiesDlg.prototype = Object.create(Dialog.prototype);
TabPropertiesDlg.prototype.constructor = TabPropertiesDlg;

export default TabPropertiesDlg;
