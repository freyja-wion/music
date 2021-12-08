import React from "react"
import { SongList, SongItem } from "./style"
import { getName } from "../../api/utils"
import {
  changePlayList,
  changeCurrentIndex,
  changeSequencePlayList,
} from "../Player/store/actionCreators"
import { connect } from "react-redux"

const SongsList = React.forwardRef((props, refs) => {
  const { collectCount, showCollect, songs } = props

  const { musicAnimation } = props

  const {
    changePlayListDispatch,
    changeCurrentIndexDispatch,
    changeSequencePlayListDispatch,
  } = props

  const totalCount = songs.length

  const selectItem = (e, index) => {
    changePlayListDispatch(songs)
    changeSequencePlayListDispatch(songs)
    changeCurrentIndexDispatch(index)
    musicAnimation(e.nativeEvent.clientX, e.nativeEvent.clientY)
  }

  let songList = (list) => {
    let res = []
    for (let i = 0; i < list.length; i++) {
      let item = list[i]
      res.push(
        <li key={item.id} onClick={(e) => selectItem(e, i)}>
          <span className="index">{i + 1}</span>
          <div className="info">
            <span>{item.name}</span>
            <span>
              {item.ar ? getName(item.ar) : getName(item.artists)} -{" "}
              {item.al ? item.al.name : item.album.name}
            </span>
          </div>
        </li>
      )
    }
    return res
  }

  const collect = (count) => {
    return (
      <div className="add_list" style={addList}>
        <i className="iconfont" style={iconFont1}>
          &#xe62d;
        </i>
        <span style={collected}>收藏({Math.floor(count / 1000) / 10}万)</span>
      </div>
    )
  }
  const firstLine = {
    boxSizing: "borderBox",
    padding: "10px 0",
    paddingLeft: "10px",
    position: "relative",
    justifyContent: "space-between",
    borderBottom: "1px solid #e4e4e4",
    background: "white",
    borderRadius:"5px"
  }
  const playAll = {
    display: "inline-block",
    lineHeight: "24px",
    color: "#2E3030",
  }
  const iconFont = {
    fontSize: "24px",
    marginRight: "10px",
    verticalAlign: "top",
  }
  const sum = {
    fontSize: "12px",
    color: "#bba8a8",
    verticalAlign: "top",
  }
  const top = {
    verticalAlign: "top",
  }
  const addList = {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    right: "0",
    top: "0",
    bottom: "0",
    width: "130px",
    lineHeight: "34px",
    background: "#d44439",
    color: "#f1f1f1",
    fontSize: "0",
    borderRadius: "3px",
    verticalAlign: "top",
  }
  const iconFont1 = {
    verticalAlign: "top",
    fontSize: "10px",
    margin: "0 5px 0 10px",
  }
  const collected = {
    fontSize: "14px",
    lineHeight: "34px",
    display: "flex",
    color: "#f2f3f4",
  }
  return (
    <SongList ref={refs} showBackground={props.showBackground}>
      <div className="first_line" style={firstLine}>
        <div
          className="play_all"
          onClick={(e) => selectItem(e, 0)}
          style={playAll}
        >
          <i className="iconfont" style={iconFont}>
            &#xe6e3;
          </i>
          <span style={top}>
            播放全部{" "}
            <span className="sum" style={sum}>
              (共{totalCount}首)
            </span>
          </span>
        </div>
        {showCollect ? collect(collectCount) : null}
      </div>
      <SongItem>{songList(songs)}</SongItem>
    </SongList>
  )
})

// 映射dispatch到props上
const mapDispatchToProps = (dispatch) => {
  return {
    changePlayListDispatch(data) {
      dispatch(changePlayList(data))
    },
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data))
    },
    changeSequencePlayListDispatch(data) {
      dispatch(changeSequencePlayList(data))
    },
  }
}

// 将ui组件包装成容器组件
export default connect(null, mapDispatchToProps)(React.memo(SongsList))
