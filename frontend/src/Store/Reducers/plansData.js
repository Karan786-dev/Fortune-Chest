export default (state = [], action) => {
    return action.type == 'PLANS_DATA' ? action.payload.data : state
}