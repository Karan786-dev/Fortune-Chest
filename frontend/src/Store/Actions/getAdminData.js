import axios from 'axios'
const { toast } = require("react-toastify");


export default () => {
    return (dispatch) => {
        axios.post(`${process.env.NEXT_PUBLIC_API}/api/admin/getData`)
            .then((result) => {
                dispatch({ type: 'ADMIN_DATA', payload: { data: result.data.data } })
            })
            .catch((error) => {
                let alert;
                switch (error?.response?.data) {
                    case 'AUTH_ERROR':
                        alert = 'Incorrect admin password'
                        break;
                    case 'ERROR':
                        alert = error.response.data.message
                    default:
                        break;
                }
            })
    }
}