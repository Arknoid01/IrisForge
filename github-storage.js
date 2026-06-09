// ── IrisForge GitHub Storage ──────────────────────────────────────────────
// Token stocké dans localStorage, jamais dans le code source

const GH = {
    owner: 'Arknoid01',
    repo:  'irisforge-data',
    branch: 'main',

    getToken() {
        return localStorage.getItem('irisforge_gh_token') || '';
    },

    _headers() {
        return {
            'Authorization': `token ${this.getToken()}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    },

    _url(filename) {
        return `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filename}`;
    },

    hasToken() {
        return !!this.getToken();
    },

    async read(filename) {
        try {
            const headers = { 'Accept': 'application/vnd.github.v3+json' };
            if (this.getToken()) headers['Authorization'] = `token ${this.getToken()}`;
            const res = await fetch(this._url(filename), {
                headers,
                signal: AbortSignal.timeout(10000)
            });
            if (res.status === 404) return { data: null, sha: null };
            if (res.status === 401) throw new Error('Token invalide ou manquant');
            if (!res.ok) throw new Error(`GitHub read error ${res.status}`);
            const json = await res.json();
            const data = JSON.parse(atob(json.content.replace(/\n/g, '')));
            return { data, sha: json.sha };
        } catch (e) {
            console.error('GH read error:', e);
            throw e;
        }
    },

    async write(filename, data, sha) {
        if (!this.getToken()) throw new Error('Token GitHub manquant — configure-le dans Paramètres');
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            const body = { message: `update ${filename}`, content, branch: this.branch };
            if (sha) body.sha = sha;
            const res = await fetch(this._url(filename), {
                method: 'PUT',
                headers: this._headers(),
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(15000)
            });
            if (res.status === 401) throw new Error('Token invalide — reconfigure-le dans Paramètres');
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
