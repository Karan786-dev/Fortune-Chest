export default (status) => {
    return (dispatch) => {
        dispatch({type:'LOADING',status:status})
    }
}