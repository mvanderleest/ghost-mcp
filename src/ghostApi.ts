import GhostAdminAPI from '@tryghost/admin-api';
import axios from 'axios';
import crypto from 'crypto';
import { GHOST_API_URL, GHOST_ADMIN_API_KEY, GHOST_API_VERSION } from './config';

export const ghostApiClient = new GhostAdminAPI({
    url: GHOST_API_URL,
    key: GHOST_ADMIN_API_KEY,
    version: GHOST_API_VERSION
});

// Ghost Admin API JWT — signed with the secret half of the Admin API key.
// Uses only Node's built-in crypto so no extra dependency is needed.
function generateGhostToken(): string {
    const [id, secret] = GHOST_ADMIN_API_KEY.split(':');
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', kid: id, typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + 300, aud: '/admin/' })).toString('base64url');
    const signingInput = `${header}.${payload}`;
    const signature = crypto
        .createHmac('sha256', Buffer.from(secret, 'hex'))
        .update(signingInput)
        .digest('base64url');
    return `${signingInput}.${signature}`;
}

// Direct HTTP client for Ghost Admin API resources not supported by the SDK
// (tiers, offers, invites, roles). Mirrors the browse/read/add/edit/delete
// interface the SDK exposes for supported resources.
export function createGhostRestClient(resource: string) {
    const baseUrl = `${GHOST_API_URL}/ghost/api/admin/${resource}`;

    function authHeaders() {
        return { Authorization: `Ghost ${generateGhostToken()}` };
    }

    return {
        async browse(params: Record<string, unknown> = {}) {
            const res = await axios.get<Record<string, unknown>>(`${baseUrl}/`, { headers: authHeaders(), params });
            return res.data[resource];
        },

        async read(data: Record<string, unknown>) {
            const { id, slug, ...params } = data;
            const url = id ? `${baseUrl}/${id}/` : `${baseUrl}/slug/${slug}/`;
            const res = await axios.get<Record<string, unknown>>(url, { headers: authHeaders(), params });
            const result = res.data[resource];
            return Array.isArray(result) ? result[0] : result;
        },

        async add(data: Record<string, unknown>) {
            const res = await axios.post<Record<string, unknown>>(`${baseUrl}/`, { [resource]: [data] }, { headers: authHeaders() });
            const result = res.data[resource];
            return Array.isArray(result) ? result[0] : result;
        },

        async edit(data: Record<string, unknown>) {
            const { id, ...rest } = data;
            const res = await axios.put<Record<string, unknown>>(`${baseUrl}/${id}/`, { [resource]: [rest] }, { headers: authHeaders() });
            const result = res.data[resource];
            return Array.isArray(result) ? result[0] : result;
        },

        async delete(data: Record<string, unknown>) {
            await axios.delete(`${baseUrl}/${data.id}/`, { headers: authHeaders() });
        },
    };
}
