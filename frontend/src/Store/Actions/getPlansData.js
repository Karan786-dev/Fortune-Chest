import axios from "axios"
import { toast } from "react-toastify"

export default () => {
    return (dispatch) => {
        axios.post(`${process.env.NEXT_PUBLIC_API}/api/plan/getAll`)
            .then((result) => {
                dispatch({ type: 'PLANS_DATA', payload: result.data })
            })
            .catch((error) => {
                toast.error(error?.response?.message || error.message)
            })
    }
}