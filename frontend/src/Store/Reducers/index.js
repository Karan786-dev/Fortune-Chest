import { combineReducers } from "redux";
import UserData from "./UserData";
import transaction from "./transaction";
import admindata from './admindata'
import plansData from './plansData'

let rootReducer = combineReducers({
    userdata: UserData,
    transactions: transaction,
    admindata: admindata,
    plansdata: plansData,
})
export default rootReducer