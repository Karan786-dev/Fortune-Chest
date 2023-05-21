export default (state = { bank: { number: 98374647383, holder: 'Karan', ifsc: 'SBIN0002339' } }, action) => {
  switch (action.type) {
    case "USERDATA":
      console.log(action.payload)
      return action.payload
    default:
      return { ...state };
  }
};

