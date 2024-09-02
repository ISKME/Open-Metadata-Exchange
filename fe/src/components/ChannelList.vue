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

        <h1 class="text-h2 font-weight-bold">OME</h1>
      </div>

      <div class="py-4" />

      <v-row>
        <v-col v-for="channel in channels" :key="channel.name" cols="12">
          <v-card
            class="py-4"
            color="surface-variant"
            image="https://cdn.vuetifyjs.com/docs/images/one/create/feature.png"
            prepend-icon="mdi-rocket-launch-outline"
            rounded="lg"
            variant="outlined"

	    @click="$router.push({ name: 'channelDetails',
		    params: {channelName: channel.name}})"
          >
            <template #image>
              <v-img position="top right" />
            </template>

            <template #title>
              <h2 class="text-h5 font-weight-bold">{{ channel.name }}</h2>
            </template>

            <template #subtitle>
              <div class="text-subtitle-1">
                {{ channel.description }}
              </div>
            </template>

            <v-overlay
              opacity=".12"
              scrim="primary"
              contained
              model-value
              persistent
            />
          </v-card>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAppStore } from "../stores/app";
import { storeToRefs } from 'pinia';

const store = useAppStore();

const { channels } = storeToRefs(store);


onMounted(() => {
    store.updateChannelList();
});
</script>
