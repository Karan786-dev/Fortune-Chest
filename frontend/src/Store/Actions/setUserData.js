const { default: axios } = require("axios");
const { toast } = require("react-toastify");

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
      switch (error?.response?.code) {
        case 'AUTH_ERROR':
          toast.warn('Please try to login again')
          localStorage.clear('token')
          break;
        default:
          console.log(error?.response?.message || error.message)
          toast.warn(error?.response?.message || error.message)
          break;
      }
    });
};

export default setUserData;
