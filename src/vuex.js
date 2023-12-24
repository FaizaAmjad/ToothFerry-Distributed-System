import Vuex from 'vuex'
import { getClinics, getDentists } from './apis/clinic'
import { getSlots, book, unBook } from './apis/booking'

const state = {
  user: null,
  clinics: [],
  dentists: [],
  selectedClinic: null,
  selectedDentist: null,
  slots: [],
  bookedSlots: [],
  clinicDentists: [],
  dentistSlots: [],
  errorMessage: null
}

const store = new Vuex.Store({
  state,
  getters: {
    user: (state) => state.user,
    clinics: (state) => state.clinics,
    dentists: (state) => state.dentists,
    slots: (state) => state.slots,
    getSelectedClinic: (state) => state.selectedClinic,
    getSelectedDentist: (state) => state.selectedDentist,
    bookedSlots: (state) => state.bookedSlots,
    clinicDentists: (state) => state.clinicDentists,
    dentistSlots: (state) => state.dentistSlots,
    errorMessage: (state) => state.errorMessage
  },
  actions: {
    user({ commit }, user) {
      commit('SET_USER', user)
    },

    async fetchClinics({ commit, dispatch, state }) {
      try {
        console.log('check if user is set. ' + state.user)
        console.log('check if user is set. ' + state.user.firstName)
        console.log('check if user is set. ' + state.user.id)
        console.log('check if user is set. ' + state.user.SSN)
        console.log('check if user is set. ' + state.user.email)
        // Make an API request to fetch all clinics information
        const clinics = await getClinics()
        clinics.forEach((clinic) => {
          console.log('Clinic name:' + clinic.clinicName)
        })
        console.log('All clinics' + clinics)
        // Update the clinic state
        commit('SET_CLINICS', clinics)
        dispatch('fetchDentists')
      } catch (error) {
        console.error('Error fetching clinic information:', error)
        let errorMessage = 'An unexpected error occurred.'

        if (error.response) {
          console.log('Error status code:', error.response.status)
          if (error.response.status === 500) {
            errorMessage = 'Server error in getting clinics.'
          } else {
            errorMessage = 'An error occurred during fetching clinics.'
          }
        }
        commit('SET_ERROR', errorMessage)
      }
    },

    async fetchDentists({ commit, dispatch }) {
      try {
        // Make an API request to fetch all clinics information
        const dentists = await getDentists()
        console.log('All dentists' + dentists)
        // Update the dentist state
        commit('SET_DENTISTS', dentists)
        dispatch('fetchSlots')
      } catch (error) {
        console.error('Error fetching dentists information:', error)
        let errorMessage = 'An unexpected error occurred.'

        if (error.response) {
          console.log('Error status code:', error.response.status)
          if (error.response.status === 500) {
            errorMessage = 'Server error in getting dentists.'
          } else {
            errorMessage = 'An error occurred during fetching dentists.'
          }
        }
        commit('SET_ERROR', errorMessage)
      }
    },

    async fetchSlots({ commit }) {
      try {
        // Make an API request to fetch slots
        const slots = await getSlots()

        // Update the slots state
        commit('SET_SLOTS', slots)
      } catch (error) {
        console.error('Error fetching slots information:', error)
        let errorMessage = 'An unexpected error occurred.'

        if (error.response) {
          console.log('Error status code:', error.response.status)
          if (error.response.status === 500) {
            errorMessage = 'Server error in getting slots.'
          } else {
            errorMessage = 'An error occurred during fetching slots.'
          }
        }
        commit('SET_ERROR', errorMessage)
      }
    },

    selectClinic({ commit, dispatch, state }, clinic) {
      console.log('selected clinic ' + clinic.clinicName)
      commit('SET_SELECTED_CLINIC', clinic)
      dispatch('clinicDentists')
      console.log('Updated state:', state.selectedClinic)
    },

    clinicDentists({ commit, state }) {
      if (!state.selectedClinic) {
        // Handle the error, maybe by returning early or setting a default value
        console.log('selected clinic not set yet. ')
        return
      }

      const clinicDentists = state.dentists.filter(
        (dentist) => dentist.clinic_id === state.selectedClinic.id
      )
      console.log('selected Clinic id: ' + state.selectedClinic._id)
      console.log('All clinic dentists: ' + clinicDentists)
      commit('SET_CLINIC_DENTISTS', clinicDentists)
      console.log('Updated clinic dentists list:', state.clinicDentists)
    },

    selectDentist({ commit, dispatch, state }, dentistId) {
      const selectedDentist = state.clinicDentists.find((d) => d._id === dentistId)
      if (selectedDentist) {
        console.log('selected dentist name: ' + selectedDentist.firstName)
        console.log('selected dentist id: ' + selectedDentist._id)
        commit('SET_SELECTED_DENTIST', selectedDentist)
        dispatch('dentistSlots')
      } else {
        console.error('Dentist not found with id:', dentistId)
      }
    },

    dentistSlots({ commit, dispatch, state }) {
      if (!state.selectedDentist) {
        // Handle the error, maybe by returning early or setting a default value
        return
      }

      const dentistSlots = state.slots.filter(
        (slot) => slot.dentist_id === state.selectedDentist._id
      )
      commit('SET_DENTIST_SLOTS', dentistSlots)
      dispatch('bookedSlots')
    },

    bookedSlots({ commit, state }) {
      const booked = []
      // get bookedSlots
      state.dentistSlots.forEach((slot) => {
        if (slot.booked) {
          booked.push(slot)
        }
      })
      commit('SET_BOOKED_SLOTS', booked)
    },

    updateBookedSlots({ dispatch }) {
      dispatch('fetchSlots')
      dispatch('dentistSlots')
    },

    async bookSlot({ commit, dispatch }, { slotId, userId }) {
      try {
        console.log('slotId in vuex for booking: ' + slotId)
        await book(slotId, userId)
        console.log(`Slot booked: by User ID ${userId}`)
        dispatch('updateBookedSlots')
      } catch (error) {
        console.error('Error booking slot', error)
        let errorMessage = 'An unexpected error occurred.'

        if (error.response) {
          console.log('Error status code:', error.response.status)
          if (error.response.status === 500) {
            errorMessage = 'Server error in booking slot.'
          } else {
            errorMessage = 'An error occurred during booking slot.'
          }
        }
        commit('SET_ERROR', errorMessage)
      }
    },

    async unBookSlot({ commit, dispatch }, { slot_id, userId }) {
      try {
        // Make an API request to unbook a slot
        await unBook(slot_id)
        console.log(`Slot unbooked: by User ID ${userId}`)
        dispatch('updateBookedSlots')
      } catch (error) {
        console.error('Error unbooking slot', error)
        let errorMessage = 'An unexpected error occurred.'

        if (error.response) {
          console.log('Error status code:', error.response.status)
          if (error.response.status === 500) {
            errorMessage = 'Server error in unbooking slot.'
          } else {
            errorMessage = 'An error occurred during unbooking slot.'
          }
        }
        commit('SET_ERROR', errorMessage)
      }
    },

    errorMessage({ commit }, errorMessage) {
      commit('SET_ERROR', errorMessage)
    }
  },
  mutations: {
    user(state, user) {
      state.user = user
    },
    SET_USER(state, user) {
      state.user = user
    },
    SET_CLINICS(state, clinics) {
      state.clinics = clinics
    },
    SET_DENTISTS(state, dentists) {
      state.dentists = dentists
    },
    SET_SLOTS(state, slots) {
      state.slots = slots
    },
    SET_SELECTED_CLINIC(state, clinic) {
      state.selectedClinic = clinic
    },
    SET_SELECTED_DENTIST(state, dentist) {
      state.selectedDentist = dentist
    },
    SET_CLINIC_DENTISTS(state, clinicDentists) {
      state.clinicDentists = clinicDentists
    },
    SET_DENTIST_SLOTS(state, dentistSlots) {
      state.dentistSlots = dentistSlots
    },
    SET_BOOKED_SLOTS(state, booked) {
      state.bookedSlots = booked
    },
    SET_ERROR(state, errorMessage) {
      state.errorMessage = errorMessage
    }
  }
})

export default store
