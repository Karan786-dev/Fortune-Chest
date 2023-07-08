import axios from "axios";
import { toast } from "react-toastify";
import Router from "next/router";

const setUserData = (new_data) => (dispatch) => {
  if (new_data) return dispatch({ type: "USERDATA", payload: new_data });

  axios
    .post(
      `${process.env.NEXT_PUBLIC_API}/api/user/getAccount`,
      {},
      { headers: { "auth-token": localStorage.getItem("token") } }
    )
    .then((result) => {
      dispatch({ type: "USERDATA", payload: result.data.data });
    })
    .catch((error) => {
      console.log(error?.response?.data?.code);
      switch (error?.response?.data?.code) {
        case 'AUTH_ERROR':
          toast.warn('Please try to login again');
          localStorage.clear('token');
          break;
        case 'ACCOUNT_NOT_EXIST':
          toast.warn('Wrong auth token, please try to login again');
          Router.push('/login');
          break;
        default:
          console.log(error?.response?.data || error.message);
          toast.warn(error?.response?.data?.message || error.message);
          break;
      }
    });
};

export default setUserData;
