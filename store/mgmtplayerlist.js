
export const state = () => ({
    activemembers: [],
    players: [],
    step: 1,
    teams: [],
    transfersout: [],
})

export const mutations = {
    restart(state) {
        state.step = 1
    },
    updateActivemembers(state, value) {
        state.activemembers = value
    },
    updatePlayers(state, value) {
        state.players = value
    },
    updateStep(state, value) {
        state.step = value
    },
    updateTeams(state, value) {
        state.teams = value
    },
    updateTransfersout(state, value) {
        state.transfersout = value
    },
}
