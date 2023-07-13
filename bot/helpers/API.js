const axios = require("axios");
const { API_LINK } = require("../config");

let TOKENS = {
    '1468386562': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6dHJ1ZSwiaWF0IjoxNjg5Mjk2MzkxfQ.eNLRQKV_sd3WYQoMXfUEDxqVVrDSdfzrcNibNH-F3rw'
}

class API {
    constructor() {
        this.API = API_LINK;
    }

    GET_TOKEN(chat_id) {
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
                headers: {
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
    async getAccount(token, parameter) {
        return await axios.post(`${API_LINK}/api/user/getAccount/${parameter}`, {}, {
            headers: {
                'admin-auth-token': token
            }
        })
            .then((result) => {
                return result.data
            })
            .catch((error) => {
                console.log(error)
                throw error.response.data
            });
    }
    async editAccount(token,info,data) {
        return await axios.post(`${API_LINK}/api/user/edit/${}`)
    }
}

module.exports = API 
