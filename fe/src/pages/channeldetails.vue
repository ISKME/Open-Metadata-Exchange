<template>
  <v-container class="fill-height">
    <v-responsive
      class="align-centerfill-height mx-auto"
      max-width="900"
    >
      <v-img
        class="mb-4"
        height="150"
        src="@/assets/logo.png"
      />

      <div class="text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>

        <h1 class="text-h2 font-weight-bold">{{ $route.params.channelName }}</h1>
      </div>

      <div class="py-4" />
      
      <v-row>
        <v-col v-for="card in cards" :key="card.number" cols="12">
	  <CatalogCard :card="card" @importCard="doImport(card.number)"/>
        </v-col>
      </v-row>
    </v-responsive>

    <v-snackbar
      v-model="snackbar"
      multi-line
    >
      {{ msg }}

      <template v-slot:actions>
        <v-btn
          color="red"
          variant="text"
          @click="snackbar = false"
        >
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>
    
  </v-container>
</template>

<script setup>
  import {useRoute} from 'vue-router';
  import { ref } from "vue";
  import axios from "axios";

  const route = useRoute();
  const cards = ref([]);
  const channelName = route.params.channelName;
const snackbar = ref(false);
const msg = ref("");

  onMounted(() => {
  axios.get("/api/channel/" + channelName + "/cards")
  .then((response) => {
    cards.value = response.data;
  })
  });

const doImport = (cardId) => {
    axios.post("/api/channel/" + channelName + "/import", {"id": cardId})
	.then((response) => {
	    if(response.data) {
		msg.value = "Saved"
		snackbar.value = true;
	    }
	    else {
		msg.value = "Couldn't save"
		snackbar.value = true;
	    }
	})
	.catch((error) => {
	    msg.value = "Error"
	    snackbar.value = true;
	})
}
</script>
