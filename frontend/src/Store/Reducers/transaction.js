export default (state = [], action) => {
    switch (action.type) {
      case "UPDATE_TRANSACTIONS":
        return action.payload
      default:
        return state;
    }
  };
  
  