const Database = require("better-sqlite3");
const Crypto = require("node:crypto");
const jsonwebtoken = require("jsonwebtoken");
const fs = require("node:fs");

module.exports.createDatabase = name => {
    const db = Database(name, { verbose: console.log });
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");
    db.exec(fs.readFileSync("migration.sql", {encoding: 'utf-8'}));
    return db;
};

const promisify =
    fn =>
    (...args) =>
        new Promise((resolve, reject) =>
            fn(...args, (err, res) => (err ? reject(err) : resolve(res)))
        );

module.exports.Password = {
    async hash(password) {
        if (password.length < 8 || password.length > 100) throw new this.PasswordLengthError();
        const salt = Crypto.randomBytes(32).toString("hex");
        const hash = (await this.scrypt(password, salt, 64)).toString("hex");
        return salt + "." + hash;
    },

    async verify({ hashed, password }) {
        const [salt, hash] = hashed.split(".");
        const candidate = (await this.scrypt(password, salt, 64)).toString("hex");
        return candidate === hash;
    },

    scrypt: promisify(Crypto.scrypt),
    PasswordLengthError: class extends Error {},
};

if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET environment variable");

module.exports.useJwt = (secret, algorithm, expiresIn) => [
    payload => jsonwebtoken.sign(payload, secret, { algorithm, expiresIn }),
    (req, res, next) => {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Missing Authorization header" });

        const [scheme, token] = header.split(" ");

        if (scheme !== "Bearer")
            return res.status(401).json({ error: "Invalid Authorization header" });

        try {
            const { username } = jsonwebtoken.verify(token, secret, { algorithms: [algorithm] });
            req.username = username;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
    },
];

module.exports.cacher = ms => fn => {
    let [timeOfLastCall, lastResult] = [0, null];

    return (...args) => {
        const now = Date.now();
        if (!timeOfLastCall || now - timeOfLastCall > ms) {
            timeOfLastCall = now;
            lastResult = fn(...args);
        }
        return lastResult;
    };
};
