const express = require ("express");
const path = require ('path');
const ejs = require ('ejs');
const { exec } = require ('child_process');
const rp = require ('request-promise-native');
const cookieParser = require ('cookie-parser');

const app = express();

const asyncMid = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(e => {
        console.log("asyncMid error", e);
        res.send({code: "fail", details: (e && e.message)?e.message:e});
    });
};

module.exports = {
    name: "express",
    init() {
        this.port = core.config.httpPort || 9999;

        app.set('view engine', 'ejs');
        const viewsPath = path.join(__dirname, '../views');
        const staticPath = path.join(__dirname, '../../');

        core.nfo("Mode: "+(process.env.NODE_ENV || "development"));
        console.log("Path to views:", viewsPath);
        console.log("Path to static:", staticPath, "...js, css");
        app.set('views', viewsPath);

        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(cookieParser());

        app.use("/js", express.static(path.join(staticPath, "js")));
        app.use("/css", express.static(path.join(staticPath, "css")));

        app.get("/", (req, res) => res.redirect("/mission01"));
        app.get("/mission01", asyncMid(this.wmsMission01), asyncMid(this.layout));
        app.get("/mission01/callback", asyncMid(this.wmsGithubCallback));

        app.all("/git/push", asyncMid(this.gitPush));

        app.listen(this.port);
        core.nfo("Express is listening at port "+this.port);

        core.render = (name, data, options) => {
            return new Promise((resolve, reject) => {
                ejs.renderFile(viewsPath+"/"+name+".ejs", data, options, (err, str) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(str);
                    }
                });
            });
        };
    },

    async gitPush(req, res, next) {
        const crypto = require('crypto');
        const payload = JSON.stringify(req.body);
        const hmac = crypto.createHmac('sha1', core.config.github.webHookSecret);
        const digest = 'sha1=' + hmac.update(payload).digest('hex');
        const checksum = req.headers['x-hub-signature'];
        if (!checksum || !digest || checksum !== digest) {
            console.log(`Request body digest (${digest}) did not match x-hub-signature (${checksum})`);
            return;
        }

        exec('sh ./update.sh',
            (error, stdout, stderr) => {
                if (error !== null) {
                    console.log(`Update error: ${error}`);
                }
            }
        );

        res.end();
    },
    
    async layout(req, res, next) {
        if (!res.locals.env) res.locals.env = process.env.NODE_ENV || "development";
        if (!res.locals.title) res.locals.title = core.config.title || "ZEL Microcore Boilerplate";

        res.send(await core.render("layout", res.locals));
    },
    
    async wmsMission01(req, res, next) {
        const a = {
            authURL: `https://github.com/login/oauth/authorize?client_id=${core.config.github.clientID}&scope=user%20repo`
        };

        const token = req.cookies.githubtoken;
        if (token) {
            try {
                const user = await rp({
                    uri: 'https://api.github.com/user',
                    headers: {
                        'Authorization': 'token '+token,
                        'User-Agent': 'request-promise'
                    },
                    json: true
                });
                a.user = {name: user.name, avatar_url: user.avatar_url}

                const repos = await rp({
                    uri: 'https://api.github.com/user/repos',
                    headers: {
                        'Authorization': 'token '+token,
                        'User-Agent': 'request-promise'
                    },
                    json: true
                });
                a.repos = repos.map(item => ({name: item.name}));
            } catch(e) {
                // probably access was revoken
            }
        }

        res.locals.page = `<index-page :data="${core.toVue(a)}"/>`;
        res.locals.styles = ['/css/wemakeservices.css'];

        next();
    },

    async wmsGithubCallback(req, res, next) {
        const { code } = req.query;
        
        const a = await rp({
            method: 'POST',
            uri: 'https://github.com/login/oauth/access_token',
            body: {
                client_id: core.config.github.clientID,
                client_secret: core.config.github.clientSecret,
                code
            },
            json: true
        });

        res.cookie('githubtoken', a.access_token, { maxAge: 157680000000, path: "/" });
        res.redirect('/mission01');
    }
};