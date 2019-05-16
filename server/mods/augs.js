module.exports = {
    init() {
        core.nfo = (s, ...r) => console.info("\x1b[35m"+s+"\x1b[0m", ...r);
        core.time = () => ~~(new Date().getTime() / 1000);
        core.toVue = s => JSON.stringify(s).replace(/\"/g, '&quot;');
    }
};