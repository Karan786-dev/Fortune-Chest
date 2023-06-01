const axios = require("axios");
const { API_LINK } = require("../config");

class API {
    constructor() {
        this.API = API_LINK;
        this.TOKENS = {};
    }

    GET_TOKEN(chat_id) {
        return this.TOKENS[chat_id];
    }

    async AUTH(password, chat_id) {
        return await axios
            .post(`${this.API}/api/auth/admin`, { password })
            .then((result) => {
                this.TOKENS[chat_id] = result.data.token
                setTimeout(() => delete this.TOKENS[chat_id], 60 * 60 * 1000)
                return result.data;
            })
            .catch((error) => {
                throw error.response.data
            });
    }

    async getAllAccounts(token, query) {
        return await axios
            .post(`${API_LINK}/api/admin/getAccounts`, query || {}, {
                Headers: {
                    'admin-auth-token': token
                }
            })
            .then((result) => {
                return result.data
            })
            .catch((error) => {
                throw error.response.data
            });
    }
}

module.exports = API 
