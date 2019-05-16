const config = require("./mods/config");
const augs = require("./mods/augs");
const express = require("./mods/express");

global.core = {       /* World #1 micro modular system, as compact as 10 lines of code. It's fully documented inline, please */
    mods: {}, nfo: (s, ...r) => console.info("%c "+s, 'color: #b0e', ...r) /* use with understanding. It's easy.    Rule #1: */
}; /* Mod MAY declare globally unique "name" field. No name = NOT MOUNTED.         Ex.: Mod {name: "A", ...} will be MOUNTED */
(async (mds) => { for (let m of mds) { /* to core.mods.A  Rule #2: Mods MAY have "init" method. Mods initialized in order of */
    m = typeof m == "function"?m():m; m && m.init && ( /* appearance.                                                        */
        m.init.constructor.name == 'AsyncFunction' ? await m.init() : m.init() /* Async inits AWAITED and can THROW.         */
    ); m && m.name && (core.mods = {...core.mods, [m.name]: m}); /*                                                          */
} core.nfo("Ready Mods: ", Object.keys(core.mods)); /*    Rule #3: Declare mods UPPER in code as JS objects, and put them... */
})([augs, () => core.nfo("ZEL Microcore v1.3"), config, express /* HERE */])
.catch(e => {console.log("INIT THROWS:",e);process&&process.exit(1)});/* [Isomorphic] ZEL Microcore v1.3 by Camra Labs, 2019 */