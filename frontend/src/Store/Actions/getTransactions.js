import axios from "axios";
const { toast } = require("react-toastify");


export default (quary, data) => {
  return (dispatch) => {
    if (data) return dispatch({ type: 'UPDATE_TRANSACTIONS', payload: data })
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API}/api/user/getTransaction`,
        { quary: quary || null },
        { headers: { "auth-token": localStorage.getItem("token") } }
      )
      .then((result) => {
        dispatch({ type: "UPDATE_TRANSACTIONS", payload: result.data.data });
      })
      .catch((error) => {
        switch (error?.response?.code) {
          case 'AUTH_ERROR':
            toast.warn('Please try to login again')
            localStorage.clear('token')
            break;
          default:
            toast.error(error?.response?.message || error.message)
            break;
        }
      });
  }
} 
