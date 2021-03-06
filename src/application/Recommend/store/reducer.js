//初始化 state 在 reducer 中进行
import * as actionTypes from "./constants"
import { fromJS } from "immutable" // 这里用到 fromJS 把 JS 数据结构转化成 immutable 数据结构

const defaultState = fromJS({
  bannerList: [],
  recommendList: [],
  enterLoading: true,
})
// eslint-disable-next-line
export default (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_BANNER:
      return state.set("bannerList", action.data)
    case actionTypes.CHANGE_RECOMMEND_LIST:
      return state.set("recommendList", action.data)
    case actionTypes.CHANGE_ENTER_LOADING:
      return state.set("enterLoading", action.data)
    default:
      return state
  }
}
