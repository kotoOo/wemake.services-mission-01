module.exports = {
    httpPort: 4110,
    title: "Mission 01 for wemake.services",
    github: {
        clientID: '590743d5193a64e2e43a',
        clientSecret: '...',
        webHookSecret: '...'
    },
    init() {
        core.config = this;
    }
};