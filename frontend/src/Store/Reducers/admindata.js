export default (state = {}, action) => {
    return action.type == 'ADMIN_DATA' ? action.payload.data : state
}