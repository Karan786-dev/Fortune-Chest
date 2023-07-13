const axios = require("axios");
const { API_LINK } = require("../config");

let TOKENS = {}

class API {
    constructor() {
        this.API = API_LINK;
    }

    GET_TOKEN(chat_id) {
        console.log(TOKENS)
        return TOKENS[chat_id];
    }

    async AUTH(password, chat_id) {
        return await axios
            .post(`${this.API}/api/auth/admin`, { password })
            .then((result) => {
                TOKENS[chat_id] = result.data.token
                setTimeout(() => delete TOKENS[chat_id], 60 * 60 * 1000)
                return result.data;
            })
            .catch((error) => {
                throw error.response.data
            });
    }

    async getAllAccounts(token, query) {
        console.log(token)
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
