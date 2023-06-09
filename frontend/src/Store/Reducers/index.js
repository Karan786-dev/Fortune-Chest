import { combineReducers } from "redux";
import UserData from "./UserData";
import transaction from "./transaction";
import admindata from './admindata'
import plansData from './plansData'
import loading from "./loading";

let rootReducer = combineReducers({
    userdata: UserData,
    transactions: transaction,
    admindata: admindata,
    plansdata: plansData,
    loading
})
export default rootReducer