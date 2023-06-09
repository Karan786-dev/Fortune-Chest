export default (state = false, action) => {
    return action.type == 'LOADING' ? (action.status) : state
}