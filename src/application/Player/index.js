import React, { useState, useRef, useEffect } from "react"
import { connect } from "react-redux"
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen,
} from "./store/actionCreators"
import MiniPlayer from "./miniPlayer"
import NormalPlayer from "./normalPlayer"
import { findIndex, getSongUrl, isEmptyObject, shuffle } from "../../api/utils"
import Toast from "../../baseUI/toast"
import { playMode } from "../../api/config"
import PlayList from "./play-list"
function Player(props) {
  //目前播放时间
  const [currentTime, setCurrentTime] = useState(0)
  //歌曲总时长
  const [duration, setDuration] = useState(0)
  //歌曲播放进度
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration
  //记录当前的歌曲，以便于下次重渲染时对比是否是一首歌
  const [preSong, setPreSong] = useState({})
  const [modeText, setModeText] = useState("")
  const {
    playing,
    fullScreen,
    currentIndex,
    currentSong: immutableCurrentSong,
    playList: immutablePlayList,
    mode, //播放模式
    sequencePlayList: immutableSequencePlayList, //顺序列表
  } = props
  const {
    toggleFullScreenDispatch,
    togglePlayingDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch,
    changePlayListDispatch, //改变playList
    changeModeDispatch, //改变mode
    togglePlayListDispatch
  } = props

  const audioRef = useRef()
  const toastRef = useRef()
  const songReady = useRef(true)
  const playList = immutablePlayList.toJS()
  const sequencePlayList = immutableSequencePlayList.toJS()
  const currentSong = immutableCurrentSong.toJS()
  const handleError = () => {
    songReady.current = true
    alert('播放出错')
  }

  useEffect(
    () => {
      if (
        !playList.length ||
        currentIndex === -1 ||
        !playList[currentIndex] ||
        playList[currentIndex].id === preSong.id ||
        !songReady.current //标志位为false
      )
        return
      let current = playList[currentIndex]
      changeCurrentDispatch(current) //赋值currentSong
      setPreSong(current)
      songReady.current = false//把标志位置为false,表现现在新的资源没有缓冲完成，不能切歌
      changeCurrentDispatch(current)//赋值 currentSong
      audioRef.current.src = getSongUrl(current.id)
      setTimeout(() => {
        audioRef.current.play().then(() => {
          songReady.current=true
        })
      })
      togglePlayingDispatch(true) //播放状态
      setCurrentTime(0) //从头开始播放
      setDuration((current.dt / 1000) | 0) //时长
    }, // eslint-disable-next-line
    [playList, currentIndex]
  )
  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause()
  }, [playing])
  const clickPlaying = (e, state) => {
    e.stopPropagation()
    togglePlayingDispatch(state)
  }
  const updateTime = (e) => {
    setCurrentTime(e.target.currentTime)
  }
  const onProgressChange = (curPercent) => {
    const newTime = curPercent * duration
    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
    if (!playing) {
      togglePlayingDispatch(true)
    }
  }
  //一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0
    changePlayingState(true)
    audioRef.current.play()
  }

  const handlePrev = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop()
      return
    }
    let index = currentIndex - 1
    if (index < 0) index = playList.length - 1
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const changeMode = () => {
    let newMode = (mode + 1) % 3
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList)
      let index = findIndex(currentSong, sequencePlayList)
      changeCurrentIndexDispatch(index)
      setModeText("顺序循环")
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList)
      setModeText("单曲循环")
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList)
      let index = findIndex(currentSong, newList)
      changePlayListDispatch(newList)
      changeCurrentIndexDispatch(index)
      setModeText("随机播放")
    }
    changeModeDispatch(newMode)
    toastRef.current.show()
  }

  const handleNext = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop()
      return
    }
    let index = currentIndex + 1
    if (index === playList.length) index = 0
    if (!playing) togglePlayingDispatch(true)
    changeCurrentIndexDispatch(index)
  }

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop()
    } else {
      handleNext()
    }
  }
  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          percent={percent}
          togglePlayList={togglePlayListDispatch}
        ></MiniPlayer>
      )}
      {isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          duration={duration} //总时长
          currentTime={currentTime} //播放时间
          percent={percent} //进度
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          onProgressChange={onProgressChange}
          handlePrev={handlePrev}
          handleNext={handleNext}
          mode={mode}
          changeMode={changeMode}
          togglePlayList={togglePlayListDispatch}
        ></NormalPlayer>
      )}
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        onError={handleError}
      ></audio>
      <PlayList></PlayList>
      <Toast text={modeText} ref={toastRef}></Toast>
    </div>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  fullScreen: state.getIn(["player", "fullScreen"]),
  playing: state.getIn(["player", "playing"]),
  currentSong: state.getIn(["player", "currentSong"]),
  showPlayList: state.getIn(["player", "showPlayList"]),
  mode: state.getIn(["player", "mode"]),
  currentIndex: state.getIn(["player", "currentIndex"]),
  playList: state.getIn(["player", "playList"]),
  sequencePlayList: state.getIn(["player", "sequencePlayList"]),
})

// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data))
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data))
    },
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data))
    },
    changeCurrentIndexDispatch(index) {
      dispatch(changeCurrentIndex(index))
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data))
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data))
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data))
    },
  }
}

// 将 ui 组件包装成容器组件
export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player))
