import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import LobbyUser, {
  ILobbyUser
} from "../../../models/colyseus-models/lobby-user"
import Message from "../../../models/colyseus-models/message"
import {
  ILeaderboardBotInfo,
  ILeaderboardInfo
} from "../../../models/colyseus-models/leaderboard-info"
import { RoomAvailable } from "colyseus.js"
import {
  IGameMetadata,
  IChatV2,
  IPreparationMetadata,
  ISuggestionUser
} from "../../../types"
import { IMeta } from "../../../models/mongo-models/meta"
import { IBot } from "../../../models/mongo-models/bot-v2"
import { IItemsStatistic } from "../../../models/mongo-models/items-statistic"
import { IPokemonConfig } from "../../../models/mongo-models/user-metadata"
import { Synergy } from "../../../types/enum/Synergy"
import { IPokemonsStatistic } from "../../../models/mongo-models/pokemons-statistic"
import { playSound, SOUNDS } from "../pages/utils/audio"
import { Language } from "../../../types/enum/Language"
import i18n from "../i18n"

export interface IUserLobbyState {
  botLogDatabase: string[]
  messages: IChatV2[]
  users: ILobbyUser[]
  leaderboard: ILeaderboardInfo[]
  botLeaderboard: ILeaderboardBotInfo[]
  levelLeaderboard: ILeaderboardInfo[]
  user: ILobbyUser | undefined
  searchedUser: ILobbyUser | undefined
  tabIndex: number
  preparationRooms: RoomAvailable[]
  gameRooms: RoomAvailable[]
  botList: { name: string; avatar: string; id: string; author: string }[]
  meta: IMeta[]
  metaItems: IItemsStatistic[]
  metaPokemons: IPokemonsStatistic[]
  pastebinUrl: string
  botData: IBot
  synergies: [Synergy, number][]
  pokemonCollection: IPokemonConfig[]
  boosterContent: string[]
  suggestions: ISuggestionUser[]
  language: Language
}

const initialState: IUserLobbyState = {
  language: Language.en,
  botLogDatabase: [],
  suggestions: [],
  boosterContent: [],
  pokemonCollection: [],
  messages: [],
  users: [],
  leaderboard: [],
  botLeaderboard: [],
  levelLeaderboard: [],
  user: undefined,
  tabIndex: 0,
  preparationRooms: [],
  gameRooms: [],
  searchedUser: undefined,
  botList: [],
  meta: [],
  metaItems: [],
  metaPokemons: [],
  pastebinUrl: "",
  synergies: [],
  botData: {
    steps: [
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      },
      {
        roundsRequired: 2,
        board: []
      }
    ],
    avatar: "ditto",
    author: "",
    elo: 1200,
    name: "ditto",
    id: ""
  }
}

export const lobbySlice = createSlice({
  name: "lobby",
  initialState: initialState,
  reducers: {
    pushBotLog: (state, action: PayloadAction<string>) => {
      state.botLogDatabase.push(action.payload)
    },
    pushMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(structuredClone(action.payload))
    },
    removeMessage: (state, action: PayloadAction<Message>) => {
      state.messages = state.messages.filter(
        (m) => m.payload !== action.payload.payload
      )
    },
    setLeaderboard: (state, action: PayloadAction<ILeaderboardInfo[]>) => {
      state.leaderboard = action.payload
    },
    setBotLeaderboard: (
      state,
      action: PayloadAction<ILeaderboardBotInfo[]>
    ) => {
      state.botLeaderboard = action.payload
    },
    setLevelLeaderboard: (state, action: PayloadAction<ILeaderboardInfo[]>) => {
      state.levelLeaderboard = action.payload
    },
    addPokemonConfig: (state, action: PayloadAction<IPokemonConfig>) => {
      state.pokemonCollection.push(action.payload)
    },
    changePokemonConfig: (
      state,
      action: PayloadAction<{ id: string; field: string; value: any }>
    ) => {
      const index = state.pokemonCollection.findIndex(
        (p) => p.id === action.payload.id
      )
      if (index !== -1) {
        state.pokemonCollection[index][action.payload.field] =
          action.payload.value
      }
    },
    addUser: (state, action: PayloadAction<LobbyUser>) => {
      const u: ILobbyUser = JSON.parse(JSON.stringify(action.payload))
      state.users.push(u)
      state.users.sort((a, b) => b.elo - a.elo)
    },
    changeUser: (
      state,
      action: PayloadAction<{ id: string; field: string; value: any }>
    ) => {
      if (state.user && action.payload.id == state.user.id) {
        state.user[action.payload.field] = action.payload.value
      }
      const index = state.users.findIndex((u) => u.id == action.payload.id)

      if (index != -1) {
        state.users[index][action.payload.field] = action.payload.value
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users.splice(
        state.users.findIndex((u) => u.id == action.payload),
        1
      )
    },
    setUser: (state, action: PayloadAction<LobbyUser>) => {
      const u: ILobbyUser = JSON.parse(JSON.stringify(action.payload))
      state.user = u
    },
    setTabIndex: (state, action: PayloadAction<number>) => {
      state.tabIndex = action.payload
    },
    addRoom: (state, action: PayloadAction<RoomAvailable>) => {
      const metadata: IPreparationMetadata | IGameMetadata =
        action.payload.metadata
      if (metadata && metadata.name) {
        const rooms =
          metadata.type === "preparation"
            ? state.preparationRooms
            : state.gameRooms
        const roomIndex = rooms.findIndex(
          (room) => room.roomId === action.payload.roomId
        )
        if (roomIndex !== -1) {
          rooms[roomIndex] = action.payload
        } else {
          if (metadata.type === "preparation") {
            playSound(SOUNDS.NEW_ROOM)
          }
          rooms.push(action.payload)
        }
      }
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      state.preparationRooms = state.preparationRooms.filter(
        (room) => room.roomId !== action.payload
      )
      state.gameRooms = state.gameRooms.filter(
        (room) => room.roomId !== action.payload
      )
    },
    setSearchedUser: (state, action: PayloadAction<LobbyUser | undefined>) => {
      state.searchedUser = action.payload
    },
    setMeta: (state, action: PayloadAction<IMeta[]>) => {
      state.meta = action.payload
    },
    setMetaItems: (state, action: PayloadAction<IItemsStatistic[]>) => {
      state.metaItems = action.payload
    },
    setMetaPokemons: (state, action: PayloadAction<IPokemonsStatistic[]>) => {
      state.metaPokemons = action.payload
    },
    setBotList: (
      state,
      action: PayloadAction<
        { name: string; avatar: string; author: string; id: string }[]
      >
    ) => {
      state.botList = action.payload
    },
    setPastebinUrl: (state, action: PayloadAction<string>) => {
      state.pastebinUrl = action.payload
    },
    setBotData: (state, action: PayloadAction<IBot>) => {
      state.botData = action.payload
    },
    setBotCreatorSynergies: (
      state,
      action: PayloadAction<Map<Synergy, number>>
    ) => {
      state.synergies = Array.from(action.payload)
    },
    setBoosterContent: (state, action: PayloadAction<string[]>) => {
      state.boosterContent = action.payload
    },
    setSuggestions: (state, action: PayloadAction<ISuggestionUser[]>) => {
      state.suggestions = action.payload
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload
    },
    leaveLobby: () => initialState
  }
})

export const {
  setLanguage,
  removeMessage,
  setBoosterContent,
  addPokemonConfig,
  changePokemonConfig,
  pushMessage,
  setLeaderboard,
  setBotLeaderboard,
  setLevelLeaderboard,
  addUser,
  changeUser,
  removeUser,
  setUser,
  setTabIndex,
  addRoom,
  removeRoom,
  setSearchedUser,
  setMeta,
  setMetaItems,
  setMetaPokemons,
  setBotList,
  setPastebinUrl,
  setBotData,
  leaveLobby,
  setBotCreatorSynergies,
  setSuggestions,
  pushBotLog
} = lobbySlice.actions

export default lobbySlice.reducer
