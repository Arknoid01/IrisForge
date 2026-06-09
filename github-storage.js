// ── IrisForge GitHub Storage ──────────────────────────────────────────────
// Stockage persistant via un repo GitHub privé
// Fichiers : prompts.json et workflows.json dans irisforge-data

const GH = {
    owner: 'Arknoid01',
    repo:  'irisforge-data',
    token: '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',
    branch: 'main',

    _headers() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    },

    _url(filename) {
        return `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filename}`;
    },

    // Lire un fichier JSON — retourne { data, sha }
    async read(filename) {
        try {
            const res = await fetch(this._url(filename), {
                headers: this._headers(),
                signal: AbortSignal.timeout(10000)
            });
            if (res.status === 404) return { data: null, sha: null };
            if (!res.ok) throw new Error(`GitHub read error ${res.status}`);
            const json = await res.json();
            const data = JSON.parse(atob(json.content.replace(/\n/g, '')));
            return { data, sha: json.sha };
        } catch (e) {
            console.error('GH read error:', e);
            return { data: null, sha: null };
        }
    },

    // Écrire un fichier JSON
    async write(filename, data, sha) {
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            const body = {
                message: `update ${filename}`,
                content,
                branch: this.branch
            };
            if (sha) body.sha = sha;
            const res = await fetch(this._url(filename), {
                method: 'PUT',
                headers: this._headers(),
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(15000)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || `GitHub write error ${res.status}`);
            }
            const json = await res.json();
            return json.content.sha;
        } catch (e) {
            console.error('GH write error:', e);
            throw e;
        }
    }
};
