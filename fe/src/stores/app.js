// Utilities
import { defineStore } from 'pinia'
import axios from "axios"

export const useAppStore = defineStore('app', {
    state: () => ({
	channels: []
    }),
    actions: {
	async updateChannelList() {
	    const data = await axios.get("/api/list");
	    this.channels = data.data;
	},
    }
})
